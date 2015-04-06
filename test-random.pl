# This POSTs a bunch of random data to the service, to make sure
# it doesn't crash.

use strict;

for(;;) {
    # The length of the post string will be a random number from 0 - 100
    my $len = int(rand(100));

    my $s = '';
    for (my $i = 0; $i < $len; ++$i) {
        my $byte = int(rand(256));
        $s .= sprintf("%s%02x", '%', $byte);
    }
    print "s = '$s'\n";

    #my $response = `curl -d '$s' http://localhost:16000`;
    #print "response = '$response'\n";

    my $response = `curl -d 'q=$s' http://localhost:16000`;
    print "response = '$response'\n";
}