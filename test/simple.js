'use strict';

/*
 * Simple API tests
 */

/*
 * Could also check out the nock package to record / replay http interactions
 */

var preq = require('preq');
var assert = require('assert');
var baseURL = 'http://localhost:10042/';

function deepEqual (result, expected) {
    try {
        assert.deepEqual(result, expected);
    } catch (e) {
        console.log('Expected:\n' + JSON.stringify(expected,null,2));
        console.log('Result:\n' + JSON.stringify(result,null,2));
        throw e;
    }
}

var testData = [
    {
        query: {
            q: 'E=mc^2'
        },
        response: {
            status: 200,
            body: {
                "mml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" alttext=\"upper E equals m c squared\">\n  <mi>E</mi>\n  <mo>=</mo>\n  <mi>m</mi>\n  <msup>\n    <mi>c</mi>\n    <mrow class=\"MJX-TeXAtom-ORD\">\n      <mn>2</mn>\n    </mrow>\n  </msup>\n</math>",
                "speakText": "upper E equals m c squared",
                "svg": "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"vertical-align: -0.167ex; \" width=\"9ex\" height=\"2.167ex\" viewBox=\"0 -904.8 3885.6 940.8\" xmlns=\"http://www.w3.org/2000/svg\" role=\"math\" aria-labelledby=\"MathJax-SVG-1-Title MathJax-SVG-1-Desc\">\n<title id=\"MathJax-SVG-1-Title\">Equation</title>\n<desc id=\"MathJax-SVG-1-Desc\">upper E equals m c squared</desc>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"10\" id=\"E1-MJMATHI-45\" d=\"M492 213Q472 213 472 226Q472 230 477 250T482 285Q482 316 461 323T364 330H312Q311 328 277 192T243 52Q243 48 254 48T334 46Q428 46 458 48T518 61Q567 77 599 117T670 248Q680 270 683 272Q690 274 698 274Q718 274 718 261Q613 7 608 2Q605 0 322 0H133Q31 0 31 11Q31 13 34 25Q38 41 42 43T65 46Q92 46 125 49Q139 52 144 61Q146 66 215 342T285 622Q285 629 281 629Q273 632 228 634H197Q191 640 191 642T193 659Q197 676 203 680H757Q764 676 764 669Q764 664 751 557T737 447Q735 440 717 440H705Q698 445 698 453L701 476Q704 500 704 528Q704 558 697 578T678 609T643 625T596 632T532 634H485Q397 633 392 631Q388 629 386 622Q385 619 355 499T324 377Q347 376 372 376H398Q464 376 489 391T534 472Q538 488 540 490T557 493Q562 493 565 493T570 492T572 491T574 487T577 483L544 351Q511 218 508 216Q505 213 492 213Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-3D\" d=\"M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-6D\" d=\"M21 287Q22 293 24 303T36 341T56 388T88 425T132 442T175 435T205 417T221 395T229 376L231 369Q231 367 232 367L243 378Q303 442 384 442Q401 442 415 440T441 433T460 423T475 411T485 398T493 385T497 373T500 364T502 357L510 367Q573 442 659 442Q713 442 746 415T780 336Q780 285 742 178T704 50Q705 36 709 31T724 26Q752 26 776 56T815 138Q818 149 821 151T837 153Q857 153 857 145Q857 144 853 130Q845 101 831 73T785 17T716 -10Q669 -10 648 17T627 73Q627 92 663 193T700 345Q700 404 656 404H651Q565 404 506 303L499 291L466 157Q433 26 428 16Q415 -11 385 -11Q372 -11 364 -4T353 8T350 18Q350 29 384 161L420 307Q423 322 423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 181Q151 335 151 342Q154 357 154 369Q154 405 129 405Q107 405 92 377T69 316T57 280Q55 278 41 278H27Q21 284 21 287Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-63\" d=\"M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n</defs>\n<g stroke=\"black\" fill=\"black\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-45\"></use>\n <use xlink:href=\"#E1-MJMAIN-3D\" x=\"1046\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-6D\" x=\"2107\" y=\"0\"></use>\n<g transform=\"translate(2990,0)\">\n <use xlink:href=\"#E1-MJMATHI-63\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"619\" y=\"583\"></use>\n</g>\n</g>\n</svg>",
                "img": "<img src=\"file.svg\" style=\"vertical-align: -0.167ex; margin-left: 0ex; margin-right: 0ex; margin-bottom: 1px; margin-top: 1px; width:9ex; height:2.167ex;\" alt=\"upper E equals m c squared\" />",
                "success": true,
                "log": "success",
                "sanetex": "E=mc^{2}"
            }
        }
    }, {
        query: {
            q: "\\Reals"
        },
        response: {
            "mml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" alttext=\"double-struck upper R\">\n<mrow class=\"MJX-TeXAtom-ORD\">\n  <mi mathvariant=\"double-struck\">R</mi>\n</mrow>\n</math>",
            "speakText": "double-struck upper R",
            "svg": "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"vertical-align: -0.167ex; \" width=\"1.667ex\" height=\"1.667ex\" viewBox=\"0 -706.9 727 731.9\" xmlns=\"http://www.w3.org/2000/svg\" role=\"math\" aria-labelledby=\"MathJax-SVG-1-Title MathJax-SVG-1-Desc\">\n<title id=\"MathJax-SVG-1-Title\">Equation</title>\n<desc id=\"MathJax-SVG-1-Desc\">double-struck upper R</desc>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"10\" id=\"E1-MJAMS-52\" d=\"M17 665Q17 672 28 683H221Q415 681 439 677Q461 673 481 667T516 654T544 639T566 623T584 607T597 592T607 578T614 565T618 554L621 548Q626 530 626 497Q626 447 613 419Q578 348 473 326L455 321Q462 310 473 292T517 226T578 141T637 72T686 35Q705 30 705 16Q705 7 693 -1H510Q503 6 404 159L306 310H268V183Q270 67 271 59Q274 42 291 38Q295 37 319 35Q344 35 353 28Q362 17 353 3L346 -1H28Q16 5 16 16Q16 35 55 35Q96 38 101 52Q106 60 106 341T101 632Q95 645 55 648Q17 648 17 665ZM241 35Q238 42 237 45T235 78T233 163T233 337V621L237 635L244 648H133Q136 641 137 638T139 603T141 517T141 341Q141 131 140 89T134 37Q133 36 133 35H241ZM457 496Q457 540 449 570T425 615T400 634T377 643Q374 643 339 648Q300 648 281 635Q271 628 270 610T268 481V346H284Q327 346 375 352Q421 364 439 392T457 496ZM492 537T492 496T488 427T478 389T469 371T464 361Q464 360 465 360Q469 360 497 370Q593 400 593 495Q593 592 477 630L457 637L461 626Q474 611 488 561Q492 537 492 496ZM464 243Q411 317 410 317Q404 317 401 315Q384 315 370 312H346L526 35H619L606 50Q553 109 464 243Z\"></path>\n</defs>\n<g stroke=\"black\" fill=\"black\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJAMS-52\"></use>\n</g>\n</svg>",
            "img": "<img src=\"file.svg\" style=\"vertical-align: -0.167ex; margin-left: 0ex; margin-right: 0ex; margin-bottom: 1px; margin-top: 1px; width:1.667ex; height:1.667ex;\" alt=\"double-struck upper R\" />",
            "success": true,
            "log": "success",
            "sanetex": "\\mathbb{R} "
        }
    }
];


describe('Simple Mathoid API tests', function () {
    before(function(cb) {
        // Wait for MathJax startup, as that's somewhat async but has a sync
        // interface
        setTimeout(cb, 1000);
    });

    describe('Standard input / output pairs', function() {
        testData.forEach(function(data) {
            it(data.query.q, function() {
                return preq.post({
                    uri: baseURL,
                    body: data.query
                })
                .then(function(res) {
                    deepEqual(res.status, 200);
                    deepEqual(res.body, data.response.body);
                });
            });
        });
    });
});
