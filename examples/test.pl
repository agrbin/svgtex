#!/usr/bin/env perl

use strict;
use warnings;

use open ':encoding(utf8)';
binmode STDOUT, ':utf8';

use LWP::UserAgent;
use HTTP::Request::Common qw{ POST };
use Getopt::Long;
use Data::Dumper;

my %options;
my $opts_ok = GetOptions(\%options,
    'verbose',
    'url=s',
);
if (!$opts_ok) {
    print "Usage:  test.pl [--verbose] [--url=http://base.url:port] [test]\n";
    exit 1;
}
my $verbose = $options{verbose};
my $url = $options{url} || 'http://localhost:16000/';

my $ua      = LWP::UserAgent->new();

# Which test(s) should we run?
my $run_all = 1;      # by default, run all tests
my %run_tests = ();   # Specific tests to run
while (my $arg = shift @ARGV) {
    $run_all = 0;
    $run_tests{$arg} = 1;
}

# Read in the list of example files
my @test_files = (<*.tex>, <*.mml>);
foreach my $test_file (@test_files) {
    if ($run_all || $run_tests{$test_file}) {
        test_one($test_file);
    }
}

print "OK\n";


# Run one test
sub test_one {
    my $filename = shift;
    (my $type = $filename) =~ s/^.*\.//;      # 'tex' or 'mml'
    my $q = do {  # slurp the file
        local $/ = undef;
        open my $f, "<", $filename or die "Can't open $filename for reading";
        <$f>;
    };

    if ($verbose) {
        print "Testing $filename:\n";
        print "  type=$type\n" .
              "  q=$q\n";
    }
    my $response = $ua->post($url, {
        'type' => $type,
        'q' => $q,
    });
    if ($response->is_error()) {
        fail($response->status_line);
    }
    my $svg  = $response->decoded_content();

    my $svg_filename = "$filename.svg";
    open my $svg_file, ">", $svg_filename or die "Can't open $svg_filename for writing";
    print $svg_file $svg;
    close $svg_file;
    if ($verbose) { print "svg: '$svg'\n\n"; }
}


sub fail {
    my $msg = shift;
    print "Failed:  $msg\n";
    exit 1;
}