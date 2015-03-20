#!/usr/bin/env perl

use strict;
use warnings;

use open ':encoding(utf8)';
binmode STDOUT, ':utf8';

use Test::More;
use YAML;
use LWP::UserAgent;
use HTTP::Request::Common qw{ POST };
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
plan tests => @$tests * 2;

foreach my $test (@$tests) {
    if ($run_all || $run_tests{$test->{name}}) {
        test_one($test);
    }
}


# Run one test
sub test_one {
    my $test = shift;
    my $test_name = $test->{name};
    my $example = $examples_by_name{$test->{example}};
    my $filename = $examples_dir . '/' . $example->{filename};
    my $request = $test->{request};
    my $expected = $test->{expected};

    my $q = do {  # slurp the file
        local $/ = undef;
        open my $f, "<", $filename or die "Can't open $filename for reading";
        <$f>;
    };

    if ($verbose) {
        print "Testing $filename:\n";
        print "  " . join("\n  ", map {"$_=$request->{$_}"} keys %$request) . "\n" .
              #"  type=$type\n" .
              "  q='" . string_start($q) . "'\n";
    }
    my $params = {
        'q' => $q,
        ($request ? %$request : ())
    };
    #print Dumper($params);
    my $response = $ua->post($url, $params);

    ok ($response->code() == $expected->{"response-code"}, 
        "Test $test_name: got expected response code");

    #ok (!$response->is_error(), "Good response for $filename") or
    #    diag("  Response status line was '" . $response->status_line . "'");

    my $content  = $response->decoded_content();
    if ($verbose) {
        print "  returned '" . string_start($content) . "'\n\n";
    }
    if ($expected->{format} && $expected->{format} eq 'svg') {
        like ($content, qr/^<svg/, "Test $test_name: response for $filename looks like SVG");
    }
    if ($writesvg) {
        my $svg_filename = "$filename.svg";
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
    return substr($s, 0, 100) . (length($s) > 100 ? "..." : "");
}

