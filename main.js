const InstructionType = {
    Rlwinm: 0,
    Clrlwi: 1
};

var outputText = "";

function DecodeInstruction() {
    DecodeRlwinm(document.getElementById("instructionString").value);
}

function DecodeRlwinm(instruction) {
    var parts = instruction.split(",");
    var decodedString = "";
    var isFlagSetVersion = false;
    var instructionType;
    var instructionName = "";
    var length = parts.length;
    outputText = "";

    if(parts[0].includes("rlwinm") && length == 5) {
        instructionType = InstructionType.Rlwinm;
        instructionName = "rlwinm";
    } else if(parts[0].includes("clrlwi") && length == 3) {
        instructionType = InstructionType.Clrlwi;
        instructionName = "clrlwi";
    } else {
        PrintText("Error: Invalid syntax");
        return;
    }

    if(parts[0].includes(".")) setsFlags = true;

    //Remove the instruction name from the first parameter string (also the dot for the version with the special dot after the name)
    parts[0] = parts[0].replace(instructionName, "").replace(".", "");

    //Remove all spaces from each part of the instruction
    for (i = 0; i < length; i++) {
        parts[i] = parts[i].replace(" ", "");
    }

    var rDest = parts[0],
        rSource = parts[1];

    if(CheckIfValidRegisterString(rDest) == false || CheckIfValidRegisterString(rSource) == false) {
        PrintText("Error: The syntax for one/both of the registers is invalid.");
        return;
    }

    var shiftAmount = 0;
    var bitmaskStart = 0;
    var bitmaskEnd = 0;

    //If the instruction is clrlwi, set the bitmask end to 31
    if(instructionType == InstructionType.Clrlwi) bitmaskEnd = 31;

    try {
        if(instructionType == InstructionType.Rlwinm) {
            for (i = 2; i < 5; i++) {
                var val = 0;
                var numString = parts[i];

                val = parseInt(numString);

                if(i == 2) shiftAmount = val;
                else if(i == 3) bitmaskStart = val;
                else if(i == 4) bitmaskEnd = val;
            }
        } else {
            var val = 0;
            var numString = parts[2];

            val = parseInt(numString);

            bitmaskStart = val;
        }

        if((bitmaskStart < 0 || bitmaskStart > 31) || (bitmaskEnd < 0 || bitmaskEnd > 31)) {
            PrintText("Error: Value for either/both the bitmask start/end index is invalid (must be between 0-31)");
            return;
        }

        if(shiftAmount < 0) {
            PrintText("Error: The shift value must be positive");
            return;
        }
    } catch (e) {
        console.log(e);
        return;
    }

    var bitmask = GenerateBitmask(bitmaskStart, bitmaskEnd);

    //If the destination and source registers are the same, and the shift amount is 0, then add &= (only anding with a given bitmask)
    if(rDest == rSource && shiftAmount == 0) {
        PrintText(rDest + " &= 0x" + NumberToHexString(bitmask) + ";");
        PrintText("Could also be:");
        PrintText(rDest + " &= ~0x" + NumberToHexString(~bitmask) + ";");
    } else {

        if(shiftAmount == 0) {
            PrintText(rDest + " = " + rSource + " & 0x" + NumberToHexString(bitmask) + ";");
            PrintText("Could also be:");
            PrintText(rDest + " = " + rSource + " & ~0x" + NumberToHexString(~bitmask) + ";");
        } else {
            PrintText(rDest + " = (" + rSource + " << " + shiftAmount + ") & 0x" + NumberToHexString(bitmask) + ";");
            PrintText("Could also be:");
            PrintText(rDest + " = (" + rSource + " << " + shiftAmount + ") & ~0x" + NumberToHexString(~bitmask) + ";");
            //right shift then and is sometimes optimized into rlwinm
            PrintText(rDest + " = (" + rSource + " >> " + (32 - shiftAmount) + ") & 0x" + NumberToHexString(bitmask) + ";");
            //PrintText(rDest + " = (rotl(" + rSource + ", " + shiftAmount + ")) & 0x" + NumberToHexString(bitmask) + ";");
        }
    }



    if(setsFlags) PrintText("Also sets EQ (= 0), GT (> 0), LT (< 0), and SO flags");
}

function GenerateBitmask(startIndex, endIndex) {
    var bitmask = 0;
    var i = startIndex;

    while (true) {
        bitmask |= 1 << (31 - i);
        if(i == endIndex) break;
        i++;
        if(i > 31) i = 0;
    }

    return bitmask;
}

function CheckIfValidRegisterString(s) {
    var result;

    if(s.length < 2 || s.length > 3 || s[0] != 'r' || (s.includes("r0") && s.length > 2)) return false;

    if(!isNaN(s.substring(1))) {
        result = parseInt(s.substring(1));
        if(result < 0 || result > 31) return false;
    } else return false;

    return true;
}

function NumberToHexString(num) {
    if(num < 0) num = 0x100000000 + num;
    return num.toString(16).toUpperCase();
}

function PrintText(text) {
    outputText += text + "<br>";
    document.getElementById("resultText").innerHTML = outputText;
}
