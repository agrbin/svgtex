#!/usr/bin/env perl
# This pings each of several instances, and should be run over a long period of
# time, to see if/when they crash.
#    - 16001:  30 seconds
#    - 16002:  5 minutes
#    - 16003:  hour
#    - 16004:  6 hours
#    - 16005:  day

use strict;
use warnings;

local $| = 1;   # autoflush stdout
use open ':encoding(utf8)';
binmode STDOUT, ':utf8';

use LWP::UserAgent;
use HTTP::Request::Common qw{ POST };
use Getopt::Long;
use Data::Dumper;

my $ua = LWP::UserAgent->new();
$ua->timeout(10);

my @instances = (
  { port => 16001, freq =>    30, },
  { port => 16002, freq =>   300, },
  { port => 16003, freq =>  3600, },
  { port => 16004, freq => 21600, },
  { port => 16005, freq => 86400, },
);

my $start_time = time();

while(1) {
    sleep(1);
    my $time_now = time();
    foreach my $inst (@instances) {
        my $last = exists($inst->{last}) ? $inst->{last} : -1;
        my $freq = $inst->{freq};
        if ($time_now - $last > $freq) {
            my $port = $inst->{port};
            my $url = "http://localhost:$port/?type=tex\&q=n^2";
            print "$time_now:  $url: ";
            my $response = $ua->get($url);
            my $status = $response->is_success ? "success" : "error: " . $response->status_line;
            print "$status\n";

            $inst->{last} = $time_now;
        }
    }
}


print "OK\n";

