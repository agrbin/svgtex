#!/usr/bin/env perl

use strict;
use warnings;

use open ':encoding(utf8)';
binmode STDOUT, ':utf8';

use Test::More;
use LWP::UserAgent;
use HTTP::Request::Common qw{ POST };
use Getopt::Long;
use Data::Dumper;

my %options;
my $opts_ok = GetOptions(\%options,
    'verbose',
    'writesvg',
    'url=s',
);
if (!$opts_ok) {
    print "Usage:  test.pl [--verbose] [--out] [--url=http://base.url:port] [test_name]\n" .
          "Options\n" .
          "  --verbose - output verbose messages\n" .
          "  --writesvg - write the svg results from each test case to a file\n" .
          "  --url=[url] - the URL of the service; defaults to http://localhost:16000/\n";
    exit 1;
}
my $verbose = $options{verbose} || 0;
my $writesvg = $options{writesvg} || 0;
my $url = $options{url} || 'http://localhost:16000/';

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
my @test_files = (<*.tex>, <*.mml>, <*.html>);
foreach my $test_file (@test_files) {
    if ($run_all || $run_tests{$test_file}) {
        test_one($test_file);
    }
}
# We'll run two tests for each of these files
plan tests => @test_files * 2;


# Run one test
sub test_one {
    my $filename = shift;
    # Set the type from the filename extenstion, either 'tex', 'mml', or 'auto'
    (my $ext = $filename) =~ s/^.*\.//;
    my $type = $ext eq 'tex' || $ext eq 'mml' ? $ext : 'auto';
    my $q = do {  # slurp the file
        local $/ = undef;
        open my $f, "<", $filename or die "Can't open $filename for reading";
        <$f>;
    };

    if ($verbose) {
        print "Testing $filename:\n";
        print "  type=$type\n" .
              "  q='" . string_start($q) . "'\n";
    }
    my $response = $ua->post($url, {
        'type' => $type,
        'q' => $q,
    });
    ok (!$response->is_error(), "Good response for $filename") or
        diag("  Response status line was '" . $response->status_line . "'");

    my $svg  = $response->decoded_content();
    if ($verbose) {
        print "  returned svg='" . string_start($svg) . "'\n\n";
    }
    like ($svg, qr/^<svg/, "Response for $filename looks like SVG");
    if ($writesvg) {
        my $svg_filename = "$filename.svg";
        open my $svg_file, ">", $svg_filename or die "Can't open $svg_filename for writing";
        print $svg_file $svg;
        close $svg_file;
    }
}

# This is for printing out a long string.  If it is > 100 characters, it is
# truncated, and an ellipsis ("...") is added.
sub string_start {
    my $s = shift;
    return substr($s, 0, 100) . (length($s) > 100 ? "..." : "");
}

