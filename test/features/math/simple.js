'use strict';

/*
 * Simple API tests
 */

/*
 * Could also check out the nock package to record / replay http interactions
 */

var preq   = require('preq');
var assert = require('../../utils/assert.js');
var server = require('../../utils/server.js');
var baseURL =  server.config.uri;

function deepEqual(result, expected) {
    try {
        assert.deepEqual(result, expected);
    } catch (e) {
      //  console.log('Expected:\n' + JSON.stringify(expected, null, 2));
      //  console.log('Result:\n' + JSON.stringify(result, null, 2));
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
                    "svg": "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"vertical-align: -0.167ex; \" width=\"9ex\" height=\"2.167ex\" viewBox=\"0 -904.8 3885.6 940.8\" xmlns=\"http://www.w3.org/2000/svg\" role=\"math\" aria-labelledby=\"MathJax-SVG-1-Title MathJax-SVG-1-Desc\">\n<title id=\"MathJax-SVG-1-Title\">Equation</title>\n<desc id=\"MathJax-SVG-1-Desc\">upper E equals m c squared</desc>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"10\" id=\"E1-MJMATHI-45\" d=\"M492 213Q472 213 472 226Q472 230 477 250T482 285Q482 316 461 323T364 330H312Q311 328 277 192T243 52Q243 48 254 48T334 46Q428 46 458 48T518 61Q567 77 599 117T670 248Q680 270 683 272Q690 274 698 274Q718 274 718 261Q613 7 608 2Q605 0 322 0H133Q31 0 31 11Q31 13 34 25Q38 41 42 43T65 46Q92 46 125 49Q139 52 144 61Q146 66 215 342T285 622Q285 629 281 629Q273 632 228 634H197Q191 640 191 642T193 659Q197 676 203 680H757Q764 676 764 669Q764 664 751 557T737 447Q735 440 717 440H705Q698 445 698 453L701 476Q704 500 704 528Q704 558 697 578T678 609T643 625T596 632T532 634H485Q397 633 392 631Q388 629 386 622Q385 619 355 499T324 377Q347 376 372 376H398Q464 376 489 391T534 472Q538 488 540 490T557 493Q562 493 565 493T570 492T572 491T574 487T577 483L544 351Q511 218 508 216Q505 213 492 213Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-3D\" d=\"M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-6D\" d=\"M21 287Q22 293 24 303T36 341T56 388T88 425T132 442T175 435T205 417T221 395T229 376L231 369Q231 367 232 367L243 378Q303 442 384 442Q401 442 415 440T441 433T460 423T475 411T485 398T493 385T497 373T500 364T502 357L510 367Q573 442 659 442Q713 442 746 415T780 336Q780 285 742 178T704 50Q705 36 709 31T724 26Q752 26 776 56T815 138Q818 149 821 151T837 153Q857 153 857 145Q857 144 853 130Q845 101 831 73T785 17T716 -10Q669 -10 648 17T627 73Q627 92 663 193T700 345Q700 404 656 404H651Q565 404 506 303L499 291L466 157Q433 26 428 16Q415 -11 385 -11Q372 -11 364 -4T353 8T350 18Q350 29 384 161L420 307Q423 322 423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 181Q151 335 151 342Q154 357 154 369Q154 405 129 405Q107 405 92 377T69 316T57 280Q55 278 41 278H27Q21 284 21 287Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-63\" d=\"M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-45\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-3D\" x=\"1046\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-6D\" x=\"2107\" y=\"0\"></use>\n<g transform=\"translate(2990,0)\">\n <use xlink:href=\"#E1-MJMATHI-63\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"619\" y=\"583\"></use>\n</g>\n</g>\n</svg>",
                    "img": "<img src=\"file.svg\" style=\"vertical-align: -0.167ex; margin-left: 0ex; margin-right: 0ex; margin-bottom: 1px; margin-top: 1px; width:9ex; height:2.167ex;\" alt=\"upper E equals m c squared\" />",
                    "success": true,
                    "log": "success",
                    "sanetex": "E=mc^{2}"
                }
            }
        }, {
            query: {
                q: "\\reals",
                type: "tex"
            },
            response: {
                status: 200,
                body: {
                    "mml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" alttext=\"double-struck upper R\">\n  <mrow class=\"MJX-TeXAtom-ORD\">\n    <mi mathvariant=\"double-struck\">R</mi>\n  </mrow>\n</math>",
                    "speakText": "double-struck upper R",
                    "svg": "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"vertical-align: -0.167ex; \" width=\"1.667ex\" height=\"1.667ex\" viewBox=\"0 -706.9 727 731.9\" xmlns=\"http://www.w3.org/2000/svg\" role=\"math\" aria-labelledby=\"MathJax-SVG-1-Title MathJax-SVG-1-Desc\">\n<title id=\"MathJax-SVG-1-Title\">Equation</title>\n<desc id=\"MathJax-SVG-1-Desc\">double-struck upper R</desc>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"10\" id=\"E1-MJAMS-52\" d=\"M17 665Q17 672 28 683H221Q415 681 439 677Q461 673 481 667T516 654T544 639T566 623T584 607T597 592T607 578T614 565T618 554L621 548Q626 530 626 497Q626 447 613 419Q578 348 473 326L455 321Q462 310 473 292T517 226T578 141T637 72T686 35Q705 30 705 16Q705 7 693 -1H510Q503 6 404 159L306 310H268V183Q270 67 271 59Q274 42 291 38Q295 37 319 35Q344 35 353 28Q362 17 353 3L346 -1H28Q16 5 16 16Q16 35 55 35Q96 38 101 52Q106 60 106 341T101 632Q95 645 55 648Q17 648 17 665ZM241 35Q238 42 237 45T235 78T233 163T233 337V621L237 635L244 648H133Q136 641 137 638T139 603T141 517T141 341Q141 131 140 89T134 37Q133 36 133 35H241ZM457 496Q457 540 449 570T425 615T400 634T377 643Q374 643 339 648Q300 648 281 635Q271 628 270 610T268 481V346H284Q327 346 375 352Q421 364 439 392T457 496ZM492 537T492 496T488 427T478 389T469 371T464 361Q464 360 465 360Q469 360 497 370Q593 400 593 495Q593 592 477 630L457 637L461 626Q474 611 488 561Q492 537 492 496ZM464 243Q411 317 410 317Q404 317 401 315Q384 315 370 312H346L526 35H619L606 50Q553 109 464 243Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJAMS-52\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
                    "img": "<img src=\"file.svg\" style=\"vertical-align: -0.167ex; margin-left: 0ex; margin-right: 0ex; margin-bottom: 1px; margin-top: 1px; width:1.667ex; height:1.667ex;\" alt=\"double-struck upper R\" />",
                    "success": true,
                    "log": "success",
                    "sanetex": "\\mathbb{R} "
                }
            }
        }, {
            query: {
                type: "asciimath",
                q: "x^2 or a_(m n) or a_{m n} or (x+1)/y or sqrtx"
            },
            response: {
                status: 200,
                body: {
                    "mml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" alttext=\"x squared or a Subscript m n Baseline or a Subscript m n Baseline or StartFraction x plus 1 Over y EndFraction or StartRoot x EndRoot\">\n  <mstyle displaystyle=\"true\">\n    <msup>\n      <mi>x</mi>\n      <mn>2</mn>\n    </msup>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <msub>\n      <mi>a</mi>\n      <mrow>\n        <mi>m</mi>\n        <mi>n</mi>\n      </mrow>\n    </msub>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <msub>\n      <mi>a</mi>\n      <mrow>\n        <mi>m</mi>\n        <mi>n</mi>\n      </mrow>\n    </msub>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <mfrac>\n      <mrow>\n        <mi>x</mi>\n        <mo>+</mo>\n        <mn>1</mn>\n      </mrow>\n      <mi>y</mi>\n    </mfrac>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <msqrt>\n      <mi>x</mi>\n    </msqrt>\n  </mstyle>\n</math>",
                    "speakText": "x squared or a Subscript m n Baseline or a Subscript m n Baseline or StartFraction x plus 1 Over y EndFraction or StartRoot x EndRoot",
                    "svg": "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"vertical-align: -2.167ex; \" width=\"36.333ex\" height=\"5.333ex\" viewBox=\"0 -1366.4 15632.3 2281.3\" xmlns=\"http://www.w3.org/2000/svg\" role=\"math\" aria-labelledby=\"MathJax-SVG-1-Title MathJax-SVG-1-Desc\">\n<title id=\"MathJax-SVG-1-Title\">Equation</title>\n<desc id=\"MathJax-SVG-1-Desc\">x squared or a Subscript m n Baseline or a Subscript m n Baseline or StartFraction x plus 1 Over y EndFraction or StartRoot x EndRoot</desc>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"10\" id=\"E1-MJMATHI-78\" d=\"M52 289Q59 331 106 386T222 442Q257 442 286 424T329 379Q371 442 430 442Q467 442 494 420T522 361Q522 332 508 314T481 292T458 288Q439 288 427 299T415 328Q415 374 465 391Q454 404 425 404Q412 404 406 402Q368 386 350 336Q290 115 290 78Q290 50 306 38T341 26Q378 26 414 59T463 140Q466 150 469 151T485 153H489Q504 153 504 145Q504 144 502 134Q486 77 440 33T333 -11Q263 -11 227 52Q186 -10 133 -10H127Q78 -10 57 16T35 71Q35 103 54 123T99 143Q142 143 142 101Q142 81 130 66T107 46T94 41L91 40Q91 39 97 36T113 29T132 26Q168 26 194 71Q203 87 217 139T245 247T261 313Q266 340 266 352Q266 380 251 392T217 404Q177 404 142 372T93 290Q91 281 88 280T72 278H58Q52 284 52 289Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-6F\" d=\"M28 214Q28 309 93 378T250 448Q340 448 405 380T471 215Q471 120 407 55T250 -10Q153 -10 91 57T28 214ZM250 30Q372 30 372 193V225V250Q372 272 371 288T364 326T348 362T317 390T268 410Q263 411 252 411Q222 411 195 399Q152 377 139 338T126 246V226Q126 130 145 91Q177 30 250 30Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-72\" d=\"M36 46H50Q89 46 97 60V68Q97 77 97 91T98 122T98 161T98 203Q98 234 98 269T98 328L97 351Q94 370 83 376T38 385H20V408Q20 431 22 431L32 432Q42 433 60 434T96 436Q112 437 131 438T160 441T171 442H174V373Q213 441 271 441H277Q322 441 343 419T364 373Q364 352 351 337T313 322Q288 322 276 338T263 372Q263 381 265 388T270 400T273 405Q271 407 250 401Q234 393 226 386Q179 341 179 207V154Q179 141 179 127T179 101T180 81T180 66V61Q181 59 183 57T188 54T193 51T200 49T207 48T216 47T225 47T235 46T245 46H276V0H267Q249 3 140 3Q37 3 28 0H20V46H36Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-6D\" d=\"M21 287Q22 293 24 303T36 341T56 388T88 425T132 442T175 435T205 417T221 395T229 376L231 369Q231 367 232 367L243 378Q303 442 384 442Q401 442 415 440T441 433T460 423T475 411T485 398T493 385T497 373T500 364T502 357L510 367Q573 442 659 442Q713 442 746 415T780 336Q780 285 742 178T704 50Q705 36 709 31T724 26Q752 26 776 56T815 138Q818 149 821 151T837 153Q857 153 857 145Q857 144 853 130Q845 101 831 73T785 17T716 -10Q669 -10 648 17T627 73Q627 92 663 193T700 345Q700 404 656 404H651Q565 404 506 303L499 291L466 157Q433 26 428 16Q415 -11 385 -11Q372 -11 364 -4T353 8T350 18Q350 29 384 161L420 307Q423 322 423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 181Q151 335 151 342Q154 357 154 369Q154 405 129 405Q107 405 92 377T69 316T57 280Q55 278 41 278H27Q21 284 21 287Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-6E\" d=\"M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-2B\" d=\"M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-31\" d=\"M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-79\" d=\"M21 287Q21 301 36 335T84 406T158 442Q199 442 224 419T250 355Q248 336 247 334Q247 331 231 288T198 191T182 105Q182 62 196 45T238 27Q261 27 281 38T312 61T339 94Q339 95 344 114T358 173T377 247Q415 397 419 404Q432 431 462 431Q475 431 483 424T494 412T496 403Q496 390 447 193T391 -23Q363 -106 294 -155T156 -205Q111 -205 77 -183T43 -117Q43 -95 50 -80T69 -58T89 -48T106 -45Q150 -45 150 -87Q150 -107 138 -122T115 -142T102 -147L99 -148Q101 -153 118 -160T152 -167H160Q177 -167 186 -165Q219 -156 247 -127T290 -65T313 -9T321 21L315 17Q309 13 296 6T270 -6Q250 -11 231 -11Q185 -11 150 11T104 82Q103 89 103 113Q103 170 138 262T173 379Q173 380 173 381Q173 390 173 393T169 400T158 404H154Q131 404 112 385T82 344T65 302T57 280Q55 278 41 278H27Q21 284 21 287Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-221A\" d=\"M95 178Q89 178 81 186T72 200T103 230T169 280T207 309Q209 311 212 311H213Q219 311 227 294T281 177Q300 134 312 108L397 -77Q398 -77 501 136T707 565T814 786Q820 800 834 800Q841 800 846 794T853 782V776L620 293L385 -193Q381 -200 366 -200Q357 -200 354 -197Q352 -195 256 15L160 225L144 214Q129 202 113 190T95 178Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-78\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"816\" y=\"583\"></use>\n<g transform=\"translate(1034,0)\">\n<g transform=\"translate(430,0)\">\n <use xlink:href=\"#E1-MJMAIN-6F\"></use>\n <use xlink:href=\"#E1-MJMAIN-72\" x=\"505\" y=\"0\"></use>\n</g>\n</g>\n<g transform=\"translate(2797,0)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n<g transform=\"translate(534,-150)\">\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-6D\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-6E\" x=\"883\" y=\"0\"></use>\n</g>\n</g>\n<g transform=\"translate(4483,0)\">\n<g transform=\"translate(430,0)\">\n <use xlink:href=\"#E1-MJMAIN-6F\"></use>\n <use xlink:href=\"#E1-MJMAIN-72\" x=\"505\" y=\"0\"></use>\n</g>\n</g>\n<g transform=\"translate(6246,0)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n<g transform=\"translate(534,-150)\">\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-6D\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-6E\" x=\"883\" y=\"0\"></use>\n</g>\n</g>\n<g transform=\"translate(7932,0)\">\n<g transform=\"translate(430,0)\">\n <use xlink:href=\"#E1-MJMAIN-6F\"></use>\n <use xlink:href=\"#E1-MJMAIN-72\" x=\"505\" y=\"0\"></use>\n</g>\n</g>\n<g transform=\"translate(9695,0)\">\n<g transform=\"translate(120,0)\">\n<rect stroke=\"none\" width=\"2518\" height=\"60\" x=\"0\" y=\"220\"></rect>\n<g transform=\"translate(60,676)\">\n <use xlink:href=\"#E1-MJMATHI-78\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-2B\" x=\"843\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-31\" x=\"1893\" y=\"0\"></use>\n</g>\n <use xlink:href=\"#E1-MJMATHI-79\" x=\"1008\" y=\"-686\"></use>\n</g>\n</g>\n<g transform=\"translate(12454,0)\">\n<g transform=\"translate(430,0)\">\n <use xlink:href=\"#E1-MJMAIN-6F\"></use>\n <use xlink:href=\"#E1-MJMAIN-72\" x=\"505\" y=\"0\"></use>\n</g>\n</g>\n<g transform=\"translate(14217,0)\">\n <use xlink:href=\"#E1-MJMAIN-221A\" x=\"0\" y=\"-109\"></use>\n<rect stroke=\"none\" width=\"577\" height=\"60\" x=\"838\" y=\"641\"></rect>\n <use xlink:href=\"#E1-MJMATHI-78\" x=\"838\" y=\"0\"></use>\n</g>\n</g>\n</svg>",
                    "img": "<img src=\"file.svg\" style=\"vertical-align: -2.167ex; margin-left: 0ex; margin-right: 0ex; margin-bottom: 1px; margin-top: 1px; width:36.333ex; height:5.333ex;\" alt=\"x squared or a Subscript m n Baseline or a Subscript m n Baseline or StartFraction x plus 1 Over y EndFraction or StartRoot x EndRoot\" />",
                    "success": true,
                    "log": "success"
                }
            }
        },{
            query: {
                type: "mml",
                q: "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" alttext=\"upper E equals m c squared\">\n  <mi>E</mi>\n  <mo>=</mo>\n  <mi>m</mi>\n  <msup>\n    <mi>c</mi>\n    <mrow class=\"MJX-TeXAtom-ORD\">\n      <mn>2</mn>\n    </mrow>\n  </msup>\n</math>"
            },
            response: {
                status: 200,
                body: {
                    "img": "<img src=\"file.svg\" style=\"vertical-align: -0.167ex; margin-left: 0ex; margin-right: 0ex; margin-bottom: 1px; margin-top: 1px; width:9ex; height:2.167ex;\" alt=\"upper E equals m c squared\" />",
                    "log": "success",
                    "mml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" alttext=\"upper E equals m c squared\">\n  <mi>E</mi>\n  <mo>=</mo>\n  <mi>m</mi>\n  <msup>\n    <mi>c</mi>\n    <mrow class=\"MJX-TeXAtom-ORD\">\n      <mn>2</mn>\n    </mrow>\n  </msup>\n</math>",
                    "speakText": "upper E equals m c squared",
                    "success": true,
                    "svg": "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"vertical-align: -0.167ex; \" width=\"9ex\" height=\"2.167ex\" viewBox=\"0 -904.8 3885.6 940.8\" xmlns=\"http://www.w3.org/2000/svg\" role=\"math\" aria-labelledby=\"MathJax-SVG-1-Title MathJax-SVG-1-Desc\">\n<title id=\"MathJax-SVG-1-Title\">Equation</title>\n<desc id=\"MathJax-SVG-1-Desc\">upper E equals m c squared</desc>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"10\" id=\"E1-MJMATHI-45\" d=\"M492 213Q472 213 472 226Q472 230 477 250T482 285Q482 316 461 323T364 330H312Q311 328 277 192T243 52Q243 48 254 48T334 46Q428 46 458 48T518 61Q567 77 599 117T670 248Q680 270 683 272Q690 274 698 274Q718 274 718 261Q613 7 608 2Q605 0 322 0H133Q31 0 31 11Q31 13 34 25Q38 41 42 43T65 46Q92 46 125 49Q139 52 144 61Q146 66 215 342T285 622Q285 629 281 629Q273 632 228 634H197Q191 640 191 642T193 659Q197 676 203 680H757Q764 676 764 669Q764 664 751 557T737 447Q735 440 717 440H705Q698 445 698 453L701 476Q704 500 704 528Q704 558 697 578T678 609T643 625T596 632T532 634H485Q397 633 392 631Q388 629 386 622Q385 619 355 499T324 377Q347 376 372 376H398Q464 376 489 391T534 472Q538 488 540 490T557 493Q562 493 565 493T570 492T572 491T574 487T577 483L544 351Q511 218 508 216Q505 213 492 213Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-3D\" d=\"M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-6D\" d=\"M21 287Q22 293 24 303T36 341T56 388T88 425T132 442T175 435T205 417T221 395T229 376L231 369Q231 367 232 367L243 378Q303 442 384 442Q401 442 415 440T441 433T460 423T475 411T485 398T493 385T497 373T500 364T502 357L510 367Q573 442 659 442Q713 442 746 415T780 336Q780 285 742 178T704 50Q705 36 709 31T724 26Q752 26 776 56T815 138Q818 149 821 151T837 153Q857 153 857 145Q857 144 853 130Q845 101 831 73T785 17T716 -10Q669 -10 648 17T627 73Q627 92 663 193T700 345Q700 404 656 404H651Q565 404 506 303L499 291L466 157Q433 26 428 16Q415 -11 385 -11Q372 -11 364 -4T353 8T350 18Q350 29 384 161L420 307Q423 322 423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 181Q151 335 151 342Q154 357 154 369Q154 405 129 405Q107 405 92 377T69 316T57 280Q55 278 41 278H27Q21 284 21 287Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMATHI-63\" d=\"M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z\"></path>\n<path stroke-width=\"10\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-45\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-3D\" x=\"1046\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-6D\" x=\"2107\" y=\"0\"></use>\n<g transform=\"translate(2990,0)\">\n <use xlink:href=\"#E1-MJMATHI-63\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"619\" y=\"583\"></use>\n</g>\n</g>\n</svg>"
                }
            }
        }
    ]
    ;


describe('Simple Mathoid API tests', function () {
    before(function (cb) {
        // Wait for MathJax startup, as that's somewhat async but has a sync
        // interface
        setTimeout(cb, 1000);
    });

    describe('Standard input / output pairs', function () {
        testData.forEach(function (data) {
            it(data.query.q, function () {
                this.timeout(15000);
                return preq.post({
                    uri: baseURL,
                    body: data.query
                })
                    .then(function (res) {
                        assert.status(res, data.response.status);
                        deepEqual(res.body, data.response.body);
                    });
            });
        });
    });
    describe('query parameter', function () {
        //TODO: Figure out error handling or remove error throwing for errors>400 in preq
        //it("missing q parameter should return 400", function () {
        //    this.timeout(15000);
        //    return preq.post({
        //        uri: baseURL,
        //        body: {}
        //    }).
        //        then(function (res) {
        //            assert.status(res, 400);
        //            deepEqual(res.body, {error: "q (query) post parameter is missing!"});
        //        });
        //});
        //it("reject invalid tex inout", function () {
        //    this.timeout(15000);
        //    return preq.post({
        //        uri: baseURL,
        //        body: {q: "\\newcommand{\\commandname}{buh}"}
        //    }).
        //        then(function (res) {
        //            assert.status(res, 400);
        //            deepEqual(res.body, {
        //                success: false,
        //                "log": "F: \\newcommand"
        //            });
        //        });
        //});
    });

});

