//create global variables
let TLC, GCSE, TIER = 0;
let TMP = false;
let TLC_FEES, GCSE_FEES;
let fees_version;
const FEES_TABLES = {
    GCSE:{
        23_24:[
            0,0,0,132,144,156,252,276,300,360,384,408,468,492,516,564,588,612,648,672,696,720,744,768
        ],
        24_25:[
            0,0,0,132,144,156,252,276,300,360,384,408,468,492,516,564,588,612,648,672,696,720,744,768
        ]
    },
    TLC:{
        23_24:[
            0,0,0,99,106,111,197,211,221,278,299,312,348,375,389,428,461,481,485,524,545,543,588,610,591,635,663
        ],
        24_25:[
            0,0,0,101,109,114,202,217,228,286,308,321,358,386,400,441,475,495,499,540,562,560,605,629,608,654,683
        ]
    }
}

//add user input to global variables
function start(tlc, gcse, t1, t2, t3, tmp, Fees_Version) {
    fees_version = Fees_Version;
    //easy ones
    TLC = tlc;
    GCSE = gcse;
    TMP = tmp;

    //annoying ones
    if (t1) {
        TIER = 0;
    } else if (t2) {
        TIER = 1;
    } else if (t3) {
        TIER = 2;
    } else {
        error("setting tier", true);
    }

    TLC_FEES = FEES_TABLES.TLC[fees_version]
    GCSE_FEES = FEES_TABLES.GCSE[fees_version]

    //run main program
    calculate();
}

//calculate 
function calculate() {
    //get a combind day count
    let combined_days = TLC + (GCSE / 2);

    //get skip values from function
    let TLC_skip_value = skip_index_getter(TLC, 0.5, 3, TLC_FEES.length, 0);
    let GCSE_days_skip_value = skip_index_getter(GCSE / 2, 0.5, 3, TLC_FEES.length, 0);
    let GCSE_skip_value = skip_index_getter(GCSE, 1, 3, GCSE_FEES.length, 0);
    let total_days_skip_value = skip_index_getter(combined_days, 0.5, 3, TLC_FEES.length, 0)

    //get all fees
    let tlc_fee = TLC_FEES[TLC_skip_value + TIER];
    let GCSE_days_fee = TLC_FEES[GCSE_days_skip_value + TIER];
    let GCSE_fee = GCSE_FEES[GCSE_skip_value + TIER];
    let combined_fee = TLC_FEES[total_days_skip_value + TIER];

    //tmp stuff
    if (TMP) {
        //convet all stuff to tmp if needed
        tlc_fee = convert_tmp(tlc_fee);
        GCSE_days_fee = convert_tmp(GCSE_days_fee);
        GCSE_fee = convert_tmp(GCSE_fee);
        combined_fee = convert_tmp(combined_fee);
    }

    //work out all output fees
    let TLC_discounted_fee = combined_fee - GCSE_days_fee;
    let total_fee = Number.parseInt(TLC_discounted_fee) + Number.parseInt(GCSE_fee);

    //check if outputs are NaN
    if (isNaN(TLC_discounted_fee) || isNaN(total_fee)) {
        //send fatal error
        error("unkown, likely input values too high", true)
    }

    //send result to out put function
    output(TLC_discounted_fee, "TLC_OUTPUT")
    output(total_fee, "TOTAL_OUTPUT")
}

//out put function to keep stuff looking clean
function output(text, element) {
    document.getElementById(element).innerHTML = "£" + text;
}

//skip value getter
function skip_index_getter(input, input_increment, output_incremnt, heighest_val, start_val) {
    //init vars
    let output = 0;
    let i = start_val;
    //loop until right value found
    for (; output < heighest_val; output += output_incremnt) {
        //check if correct
        if (input === i) {
            return output;
        } else {
            i += input_increment
        }
    }
    //error thing
    error("getting index", false);
}

//tmp converter function
function convert_tmp(value) {
    //do math
    let i = (value * 10) / 12;
    //round numbers and return
    return Math.round(i);
}


//error function to call if anything goes wrong 
function error(process, endprogram) {
    console.log("an error occurd whilst: " + process);
    if (endprogram) {
        output("ERROR", "TLC_OUTPUT");
        output("ERROR", "TOTAL_OUTPUT");
        throw "critical error!"
    }
}