const InstructionType = {
    Rlwinm: 0,
    Extlwi: 1,
    Extrwi: 2,
    Rotlwi: 3,
    Rotrwi: 4,
    Slwi: 5,
    Srwi: 6,
    Clrlwi: 7,
    Clrrwi: 8,
    Clrlslwi: 9,
    Rlwimi: 10,
    Inslwi: 11,
    Insrwi: 12,
    Rlwnm: 13,
    Rotlw: 14
};

let instructions = [
    {
        "name": "rlwinm",
        "args": 5
    },
    {
        "name": "extlwi",
        "args": 4
    },
    {
        "name": "extrwi",
        "args": 4
    },
    {
        "name": "rotlwi",
        "args": 3
    },
    {
        "name": "rotrwi",
        "args": 3
    },
    {
        "name": "slwi",
        "args": 3
    },
    {
        "name": "srwi",
        "args": 3
    },
    {
        "name": "clrlwi",
        "args": 3
    },
    {
        "name": "clrrwi",
        "args": 3
    },
    {
        "name": "clrlslwi",
        "args": 4
    },
    {
        "name": "rlwimi",
        "args": 5
    },
    {
        "name": "inslwi",
        "args": 4
    },
    {
        "name": "insrwi",
        "args": 4
    },
    {
        "name": "rlwnm",
        "args": 5
    },
    {
        "name": "rotlw",
        "args": 3
    }
];


var outputText = "";

function Decode() {
    DecodeInstruction(document.getElementById("instructionString").value);
}

function DecodeInstruction(instruction) {
    var parts = instruction.split(",");
    var decodedString = "";
    var isFlagSetVersion = false;
    var instructionType;
    var instructionData;
    var instructionName = "";
    var length = parts.length;
    outputText = "";
    var validInstruction = false;

    for(i = 0; i < instructions.length; i++){
        if(parts[0].includes(instructions[i].name) && length == instructions[i].args){
            instructionType = i;
            instructionName = instructions[i].name;
            instructionData = instructions[i];
            validInstruction = true;
            break;
        }
    }

    if(!validInstruction){
        PrintText("Error: Invalid instruction");
        return;
    }

    setsFlags = false;

    if(parts[0].includes(".")) setsFlags = true;

    //Remove the instruction name from the first parameter string (also the dot for the version with the special dot after the name)
    parts[0] = parts[0].replace(instructionName, "").replace(".", "");

    //Remove all spaces from each part of the instruction
    for (i = 0; i < length; i++) {
        parts[i] = parts[i].replace(/\s+/g, '');
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
    var rShiftAmount = ""; //used for rlwnm/rotlw

    try {
        if(instructionType == InstructionType.Rlwinm || instructionType == InstructionType.Rlwimi) {
            for (i = 2; i < 5; i++) {
                var val = 0;
                var numString = parts[i];

                val = parseInt(numString);

                if(i == 2) shiftAmount = val;
                else if(i == 3) bitmaskStart = val;
                else if(i == 4) bitmaskEnd = val;
            }
        }else if(instructionType == InstructionType.Rlwnm){
            rShiftAmount = parts[2];
            if(CheckIfValidRegisterString(rShiftAmount) == false){
                PrintText("Error: The syntax for the shift amount register is invalid.");
                return;
            }

            bitmaskStart = parseInt(parts[3]);
            bitmaskStart = parseInt(parts[4]);
        } else if(instructionType == InstructionType.Rotlwi || instructionType == InstructionType.Rotrwi || instructionType == InstructionType.Slwi || instructionType == InstructionType.Srwi || instructionType == InstructionType.Clrlwi || instructionType == InstructionType.Clrrwi){
           //rlwinm/rlwimi mnemonics w/ 3 arguments
            var val = 0;
            var numString = parts[2];

            val = parseInt(numString);

            if(instructionType == InstructionType.Rotlwi){
                bitmaskStart = 0;
                bitmaskEnd = 31;
                shiftAmount = val;
            }else if(instructionType == InstructionType.Rotrwi){
                bitmaskStart = 0;
                bitmaskEnd = 31;
                shiftAmount = 32 - val;
            }else if(instructionType == InstructionType.Slwi){
                bitmaskStart = 0;
                bitmaskEnd = 31 - val;
                shiftAmount = val;
            }else if(instructionType == InstructionType.Srwi){
                bitmaskStart = val;
                bitmaskEnd = 31;
                shiftAmount = 32 - val;
            }else if(instructionType == InstructionType.Clrlwi){
                bitmaskStart = val;
                bitmaskEnd = 31;
                shiftAmount = 0;
            }else if(instructionType == InstructionType.Clrrwi){
                bitmaskStart = 0;
                bitmaskEnd = 31 - val;
                shiftAmount = 0;
            }
        }else if(instructionType == InstructionType.Extlwi || instructionType == InstructionType.Extrwi || instructionType == InstructionType.Clrlslwi || instructionType == InstructionType.Inslwi || instructionType == InstructionType.Insrwi){
            //rlwinm/rlwimi mnmemonics w/ 4 arguments
            var numString1 = parts[2];
            var numString2 = parts[3];
            var val1 = parseInt(numString1);
            var val2 = parseInt(numString2)

            if(instructionType == InstructionType.Extlwi){ //rlwinm mnemonics
                bitmaskStart = 0;
                bitmaskEnd = val1 - 1;
                shiftAmount = val2;
            }else if(instructionType == InstructionType.Extrwi){
                bitmaskStart = 32 - val1;
                bitmaskEnd = 31;
                shiftAmount = val2 + val1;
            }else if(instructionType == InstructionType.Clrlslwi){
                bitmaskStart = val1 - val2;
                bitmaskEnd = 31 - val2;
                shiftAmount = val2;
            }else if(instructionType == InstructionType.Inslwi){ //rlwimi mnemonics
                bitmaskStart = val2;
                bitmaskEnd = val2 + val1 - 1;
                shiftAmount = 32 - val2;
            }else if(instructionType == InstructionType.Insrwi){
                bitmaskStart = val2;
                bitmaskEnd = (val2 + val1) - 1;
                shiftAmount = 32 - (val2 + val1);
            }

        }else if(instructionType == InstructionType.Rotlw){
            //rotlw (rlwmn mnemonic)
            rShiftAmount = parts[2];
            if(CheckIfValidRegisterString(rShiftAmount) == false){
                PrintText("Error: The syntax for the shift amount register is invalid.");
                return;
            }

            bitmaskStart = 0;
            bitmaskStart = 31;
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

    if(instructionType == InstructionType.Rlwinm || instructionType == InstructionType.Rotlwi || instructionType == InstructionType.Rotrwi || instructionType == InstructionType.Slwi || instructionType == InstructionType.Srwi || instructionType == InstructionType.Clrlwi || instructionType == InstructionType.Clrrwi || instructionType == InstructionType.Extlwi || instructionType == InstructionType.Extrwi || instructionType == InstructionType.Clrlslwi){
       //Rlwinm
        //If the destination and source registers are the same, and the shift amount is 0, then add &= (only anding with a given bitmask)
        if(rDest == rSource && shiftAmount == 0) {
            PrintText(rDest + " &= " + NumberToHexString(bitmask) + ";");
            PrintText("Could also be:");
            PrintText(rDest + " &= ~" + NumberToHexString(~bitmask) + ";");
        } else {
            if(shiftAmount == 0) {
                PrintText(rDest + " = " + rSource + " & " + NumberToHexString(bitmask) + ";");
                PrintText("Could also be:");
                PrintText(rDest + " = " + rSource + " & ~" + NumberToHexString(~bitmask) + ";");
            } else {
              /* mwcc sometimes does an optimization where n*2^m will become rlwinm, where the zero bits are ensured to be 0
              through anding with a bitmask (for example, n*4 becomes n<<2 & ~0x3, clearing the lower bits */
              console.log(NumberToHexString(~((1 << shiftAmount) - 1)));
              console.log(NumberToHexString(~(((1 << (32-shiftAmount)) - 1) << shiftAmount)));
              if(bitmask == (~((1 << shiftAmount) - 1))){
                  PrintText(rDest + " = " + rSource + " << " + shiftAmount + ";");
              }else if(bitmask == ~(((1 << (32-shiftAmount)) - 1) << shiftAmount)){
                //for division, the same happens, except the top bits are cleared (bits are effectively right shifted through rlwinm)
                PrintText(rDest + " = " + rSource + " >> " + (32 - shiftAmount) + ";");
              }else{
                PrintText(rDest + " = (" + rSource + " << " + shiftAmount + ") & " + NumberToHexString(bitmask) + ";");
                PrintText("Could also be:");
                PrintText(rDest + " = (" + rSource + " << " + shiftAmount + ") & ~" + NumberToHexString(~bitmask) + ";");
                //right shift then and is sometimes optimized into rlwinm
                PrintText(rDest + " = (" + rSource + " >> " + (32 - shiftAmount) + ") & " + NumberToHexString(bitmask) + ";");
                //PrintText(rDest + " = (rotl(" + rSource + ", " + shiftAmount + ")) & 0x" + NumberToHexString(bitmask) + ";");
          }
        }
      }

        rangeStart = 31 - bitmaskEnd - shiftAmount;
        rangeEnd = 31 - bitmaskStart - shiftAmount;
        
        startBit = rangeStart;
        endBit = rangeEnd;
        
        if(startBit < 0) startBit = 32 + startBit;
        if(endBit < 0) endBit = 32 + endBit;
        if(startBit > 31)startBit %= 31;
        if(endBit > 31) endBit %= 31;
        
        bits = Math.abs(endBit - startBit) + 1;
        
        if(bits > 1){
        PrintText("Other info: accesses  bits " + startBit + "-" + endBit);
        }else{
          PrintText("Other info: accesses bit " + startBit);
        }
    }else if(instructionType == InstructionType.Rlwimi || instructionType == InstructionType.Inslwi || instructionType == InstructionType.Insrwi){
         //Rlwimi instructions
        //If the destination and source registers are the same, and the shift amount is 0, then add &= (only anding with a given bitmask)
        if(rDest == rSource && shiftAmount == 0) {
            PrintText(rDest + " = " + rDest + ";");
        } else {
            if(shiftAmount == 0) {
                //rDest = (rSource & bitmask) + (rDest && ~bitmask)
                PrintText(rDest + " = (" + rSource + " & " + NumberToHexString(bitmask) + ") + (" + rDest + " & " + NumberToHexString(~bitmask) + ");");
                PrintText("Could also be:");
                PrintText(rDest + " = (" + rSource + " & ~" + NumberToHexString(~bitmask) + ") + (" + rDest + " & ~" + NumberToHexString(bitmask) + ");");
            } else {
                //rDest = ((rSource << shiftamount) & bitmask) + (rDest & ~bitmask)
                PrintText(rDest + " = ((" + rSource + "<< " + shiftAmount + ") & " + NumberToHexString(bitmask) + ") + (" + rDest + " & " + NumberToHexString(~bitmask) + ");");
                PrintText("Could also be:");
                PrintText(rDest + " = ((" + rSource + "<< " + shiftAmount + ") & ~" + NumberToHexString(~bitmask) + ") + (" + rDest + " & ~" + NumberToHexString(bitmask) + ");");
            }
        }
    }else{
         //Rlwnm instructions
        PrintText(rDest + " = (" + rSource + " << " + rShiftAmount + ") & " + NumberToHexString(bitmask) + ";");
        PrintText("Could also be:");
        PrintText(rDest + " = (" + rSource + " << " + rShiftAmount + ") & ~" + NumberToHexString(~bitmask) + ";");

        rangeStart = 31 - bitmaskEnd - shiftAmount;
        rangeEnd = 31 - bitmaskStart - shiftAmount;
        
        startBit = rangeStart;
        endBit = rangeEnd;
        
        if(startBit < 0) startBit = 32 + startBit;
        if(endBit < 0) endBit = 32 + endBit;
        if(startBit > 31)startBit %= 31;
        if(endBit > 31) endBit %= 31;
        
        bits = Math.abs(endBit - startBit) + 1;
        
        if(bits > 1){
        PrintText("Other info: accesses  bits " + startBit + "-" + endBit);
        }else{
          PrintText("Other info: accesses bit " + startBit);
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
    return "0x" + num.toString(16).toUpperCase();
}

function PrintText(text) {
    outputText += text + "<br>";
    document.getElementById("resultText").innerHTML = outputText;
}

// Get the input field
var input = document.getElementById("instructionString");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("button").click();
  }
});
