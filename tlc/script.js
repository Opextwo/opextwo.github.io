//create global variables
let TLC, GCSE, TIER = 0;
let TMP = false;
let TLC_URL = "https://raw.githubusercontent.com/Opextwo/opextwo.github.io/main/tlc/tlc_fees_24-25.csv";
const GCSE_URL = "https://raw.githubusercontent.com/Opextwo/opextwo.github.io/main/tlc/gcse_fees.csv";
let TLC_FEES, GCSE_FEES;
let fees_version;

//add user input to global variables
async function start(tlc, gcse, t1, t2, t3, tmp, Fees_Version) {
    fees_version = Fees_Version;
    //easy ones
    TLC = tlc;
    GCSE = gcse;
    TMP = tmp;

    TLC_URL = "https://raw.githubusercontent.com/Opextwo/opextwo.github.io/main/tlc/tlc_fees_" + fees_version + ".csv";

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

    //get csv data
    await fetch_csvs();

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

//fetch csv data for both TLC & GCSE function
async function fetch_csvs() {
    try {
        const response = await fetch(TLC_URL);
        if (!response.ok) throw new Error('Failed to fetch CSV data');

        const csvData = await response.text();
        TLC_FEES = csvData.split('\n').flatMap(row => row.split(',')).filter(value => value.trim() !== '');
    } catch (error) {
        error("fetching csv for TLC fees", true);
    }
    try {
        const response = await fetch(GCSE_URL);
        if (!response.ok) throw new Error('Failed to fetch CSV data');

        const csvData = await response.text();
        GCSE_FEES = csvData.split('\n').flatMap(row => row.split(',')).filter(value => value.trim() !== '');
    } catch (error) {
        error("fetching csv for GCSE fees", true);
    }
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