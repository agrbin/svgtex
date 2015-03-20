#!/usr/bin/env perl

use strict;
use warnings;

use open ':encoding(utf8)';
binmode STDOUT, ':utf8';

use Test::More;
use YAML;
use LWP::UserAgent;
use URI::Encode qw(uri_encode);
#use HTTP::Request::Common qw{ POST };
use Getopt::Long;
use Data::Dumper;

my $examples_dir = 'examples';
my $default_service_url = 'http://localhost:16000/';

my %options;
my $opts_ok = GetOptions(\%options,
    'verbose',
    'writesvg',
    'url=s',
);
if (!$opts_ok) {
    print "Usage:  test.pl [options] [test_name]\n" .
          "Options\n" .
          "  --verbose - output verbose messages\n" .
          "  --writesvg - write the svg results from each test case to a file\n" .
          "  --url=[url] - the URL of the service; defaults to $default_service_url/\n";
    exit 1;
}
my $verbose = $options{verbose} || 0;
my $writesvg = $options{writesvg} || 0;
my $url = $options{url} || $default_service_url;

my $ua      = LWP::UserAgent->new();
print "Testing service at $url\n";

# Which test(s) should we run?
my $run_all = 1;      # by default, run all tests
my %run_tests = ();   # Specific tests to run
while (my $arg = shift @ARGV) {
    $run_all = 0;
    $run_tests{$arg} = 1;
}



# Read in the list of example files
my $examples = Load(do {
    local $/ = undef;
    my $fn = "$examples_dir/examples.yaml";
    open my $F, "<", $fn or die "Can't read $fn";
    <$F>;
});
my %examples_by_name = map { $_->{name} => $_ } @$examples;
#print Dumper(\%examples_by_name);

# Read in the list of tests
my $tests = Load(do {
    local $/ = undef;
    my $fn = "tests.yaml";
    open my $F, "<", $fn or die "Can't read $fn";
    <$F>;
});
#print Dumper($tests);


#my @test_files = (<examples/*.tex>, <examples/*.mml>, <examples/*.html>);

# We'll run two tests for each of these files
#plan tests => @$tests * 2;

foreach my $test (@$tests) {
    if ($run_all || $run_tests{$test->{name}}) {
        test_one($test);
    }
}

done_testing();


# Run one test
sub test_one {
    my $test = shift;
    my $test_name = $test->{name};
    my $request = $test->{request} || {};
    my $expected = $test->{expected};

    if ($request->{example}) {
        my $example = $examples_by_name{$request->{example}};
        my $filename = $examples_dir . '/' . $example->{filename};
        $request->{q} = do {  # slurp the file
            local $/ = undef;
            open my $f, "<", $filename or die "Can't open $filename for reading";
            <$f>;
        };
        delete $request->{example};
    }
    my $request_method = 'POST';
    if ($request->{method}) {
        $request_method = $request->{method};
        delete $request->{method};
    }

    print "\$request: " . Dumper($request) if $verbose;

    # Execute the request; either GET or POST
    my $response;
    if ($request_method eq 'GET') {
        # Construct the GET URL from the request parameters
        my $get_url = $url . ((keys $request == 0) ? '' :
            '?' . join('&', map {
                $_ . '=' .uri_encode($request->{$_})
            } keys $request));
        print "Testing $test_name: $request_method: $get_url\n" if $verbose;
        $response = $ua->get($get_url);
    }
    else {
        if ($verbose) {
            print "Testing $test_name: ". $request_method . ":\n";
            print "  " . join("\n  ", map {
                    "$_=" . ($_ eq 'q' ? string_start($request->{$_}) : $request->{$_})
                } keys %$request) . "\n";
        }
        $response = $ua->post($url, $request);
    }

    my $expected_code = $expected->{code} || 200;
    is ($response->code(), $expected_code, 
        "Test $test_name: got expected response code $expected_code");

    #ok (!$response->is_error(), "Good response for $filename") or
    #    diag("  Response status line was '" . $response->status_line . "'");

    my $content  = $response->decoded_content();
    if ($verbose) {
        print "  returned '" . string_start($content) . "'\n";
    }

    if ($expected->{'content-contains'}) {
        ok (index($content, $expected->{'content-contains'}) != -1,
            "Test $test_name: response contains expected string");
    }

    my $expected_content_type = $expected->{'content-type'} || 'image/svg+xml; charset=utf-8';
    is ($response->header('content-type'), $expected_content_type,
        "Test $test_name: expected content-type: " . $expected_content_type);

    if ($expected->{format} && $expected->{format} eq 'svg') {
        like ($content, qr/^<svg/, "Test $test_name: response looks like SVG");
    }

    if ($writesvg) {
        my $svg_filename = "$test_name.svg";
        open my $svg_file, ">", $svg_filename or die "Can't open $svg_filename for writing";
        print $svg_file $content;
        close $svg_file;
    }
}




# This is for printing out a long string.  If it is > 100 characters, it is
# truncated, and an ellipsis ("...") is added.
sub string_start {
    my $s = shift;
    chomp $s;
    my $ss = substr($s, 0, 100);
    $ss =~ s/\n/\\n/gs;
    return $ss . (length($s) > 100 ? "..." : "");
}

