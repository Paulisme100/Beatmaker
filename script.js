window.onload = function() {

    //tempoGroup set up
    tempoRange = document.getElementById("tempoRange")
    tempoValue = document.getElementById("tempoValue")
    tempoVar = 120

    tempoRange.addEventListener('input', (e) => {
        tempoValue.textContent = e.target.value;
        tempoVar = e.target.value
    })

    //samples, sound ctx and canvas
    kickPad = document.querySelector(".pad1")
    snarePad = document.querySelector(".pad2")
    closedHatPad = document.querySelector(".pad3")
    clapPad = document.querySelector(".pad4")
    hihatPad = document.querySelector(".pad5")
    openHatPad = document.querySelector(".pad6")
    rimshotPad = document.querySelector(".pad7")
    ridePad = document.querySelector(".pad8")

    loadBtn = document.getElementById('loadSamples')

    let audioContext;
    canvas = document.getElementById('songCanvas')
    canvas.width = 1700
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    //draw the canvas table
    drawCanvas()
    let samplesNo = 0 


    // //set the audio context
    // setBtn.addEventListener('click', () => {
    //     audioContext = new AudioContext();
    //     console.log("Audio Context Started!")

    // })

//implementation with .then and setTimeout
    /*
    let arrayBuffer;
    loadBtn.addEventListener('click', () => {
        let arrayBufferPromise = fetch("./sounds/kick181.wav").then((response) => response.arrayBuffer()).then((result) => arrayBuffer = result) //<-- fetch response
        setTimeout(function() {
            console.log(arrayBuffer)

            audioContext = new AudioContext();

            let audioResolvedPromise;
            audioContext.decodeAudioData(arrayBuffer).then(result => {audioResolvedPromise = result})
            
            setTimeout(function(){
                console.log(audioResolvedPromise)
                let bufferSource = audioContext.createBufferSource()
                bufferSource.buffer = audioResolvedPromise
                bufferSource.connect(audioContext.destination)
                bufferSource.start()
            }, 500)

        }, 500)
        

        // let bufferSource = audioContext.createBufferSource()
        // bufferSource.buffer = audioBuffer
        // bufferSource.start()
    })
    */

    sounds = [] //array of audioBuffer objects containing the samples
    paths = ["./sounds/kick181.wav", "./sounds/snare140.wav", "./sounds/hi-hat64.wav", "./sounds/doubled-clap.wav", "./sounds/hi_hat_4.wav", "./sounds/open-hat1.wav", "./sounds/rim-shot.wav", "./sounds/ride1.wav"]
    effectsOnSamples = [ {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}, {lowPassOn: false, highPassOn: false, panLeft: false, panRight: false}]
    loadBtn.addEventListener('click', () => {

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("Audio Context Started!")
        setSounds(paths)
    })

    //define the code array that mirrors the canvas table
    soundGridArr = new Array(8)
    //define the item for the soundGrid
    class SoundItem {

        activated;
        audioBuffer;
        constructor(activated){
            this.activated = activated
        }

        activateAndSet(audioBuffer) {
            this.activated = true;
            this.audioBuffer = audioBuffer
        }

        deactivate() {
            this.activated = false;
            this.audioBuffer = null;
        }

        produceSound() {
            let i = this.getSampleIndex()
            
            let bufferSrc = audioContext.createBufferSource()
            bufferSrc.buffer = this.audioBuffer

            let lowCutoff = 22050; //by default the cutoff is the highest possible so that all frequencies can pass and the sound is unaffected
            if(effectsOnSamples[i].lowPassOn) //if the lowPass box is checked, then a cutoff is set to 4500hz
                lowCutoff = 4500

            let lpfilter = audioContext.createBiquadFilter()
            lpfilter.type = "lowpass";
            lpfilter.frequency.value = lowCutoff

            let highCutoff = 0; //by default the cutoff is the lowest possible so that all frequencies can pass and the sound is unaffected
            if(effectsOnSamples[i].highPassOn) //if the highPass box is checked, then a cutoff is set to 3000hz
                highCutoff = 3000

            let hpfilter = audioContext.createBiquadFilter()
            hpfilter.type = "highpass";
            hpfilter.frequency.value = highCutoff

            let panValue1 = 0
            if(effectsOnSamples[i].panLeft)
                panValue1 = -1
            let panLeftNode = audioContext.createStereoPanner();
            panLeftNode.pan.value = panValue1;

            let panValue2 = 0
            if(effectsOnSamples[i].panRight)
                panValue2 = 1
            let panRightNode = audioContext.createStereoPanner();
            panRightNode.pan.value = panValue2;

            bufferSrc.connect(lpfilter)
            lpfilter.connect(hpfilter)
            hpfilter.connect(panLeftNode)
            panLeftNode.connect(panRightNode)
            panRightNode.connect(audioContext.destination)
            bufferSrc.start()
        }

        getSampleIndex(){
            if(this.audioBuffer)
            {
                for(let i = 0; i<sounds.length; i++)
                {
                    if(this.audioBuffer == sounds[i])
                        return i;
                }
            }
        }
    }

    initSoundGrid()

    async function setSounds(paths)
    {
        for(let i =0; i<paths.length; i++)
        {
            let audioBuffer = await getFromFile(paths[i])
            sounds.push(audioBuffer)
        }
    }

    async function getFromFile(filePath){
        let response = await fetch(filePath)
        let arrayBuffer = await response.arrayBuffer()
        let audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        return audioBuffer;
    }

    kickPad.addEventListener('click', () => {
        if(!audioContext)
        {
            alert("Load Samples First!")
        }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[0]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 0

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = kickPad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 70/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    snarePad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[1]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 1

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = snarePad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 70/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    closedHatPad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[2]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 2

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = closedHatPad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 30/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    clapPad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[3]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 3

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = clapPad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 70/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    hihatPad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[4]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 4

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = hihatPad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 70/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    openHatPad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[5]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 5

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = openHatPad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 30/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    rimshotPad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[6]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 6

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = rimshotPad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 30/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    ridePad.addEventListener('click', () => {
        if(!audioContext)
            {
                alert("Load Samples First!")
            }
        //produce the sound when the pad is clicked
        let sampleBufferSrc = audioContext.createBufferSource()
        sampleBufferSrc.buffer = sounds[7]
        sampleBufferSrc.connect(audioContext.destination)
        sampleBufferSrc.start()

        //put the sound in the grid array at the corresponding line from canvas
        soundGridArr[samplesNo][0] = 7

        //put the sound on canvas
        ctx.fillStyle = 'rgb(53, 53, 223)'
        console.log(samplesNo)
        ctx.fillRect(0, samplesNo*50, 100-1, 48)
        let text = ridePad.children[0].textContent;
        ctx.fillStyle = 'yellow'
        ctx.font = '16px Arial'
        ctx.fillText(text, 8/2, samplesNo*(50-2)+28)
        samplesNo = samplesNo + 1
    })

    canvas.addEventListener('click', (e) => {
        //get the coordinates of the point clicked
        x = e.offsetX;
        y = e.offsetY;
        console.log("x: " + x + ", y: " + y)
        if(x > 100)
        {
            itemLine = Math.ceil(y/50)
            //console.log("Sound of the line: " + soundGridArr[itemLine-1][0])
            if(itemLine <= samplesNo)
            {
                //get the position of the item in the canvas table
                xOrigin = Math.floor(x/100)
                yOrigin =  Math.floor(y/50)

                //get the position of the item in the sound Grid array
                i = yOrigin
                j = xOrigin

                if(soundGridArr[i][j].activated === false)
                {
                    //modify the table to display the activated sound
                    ctx.fillStyle = 'rgb(246, 196, 198)'
                    ctx.fillRect(xOrigin*100, yOrigin*50, 98, 48)

                    //get the sample for the audioBuffer
                    sampleIndex = soundGridArr[itemLine-1][0]
                    correspondingSound = sounds[sampleIndex] //the audioBuffer object containing the sound

                    //change the attributes of the object accordingly, using the specific function 
                    soundGridArr[i][j].activateAndSet(correspondingSound);
                } else if(soundGridArr[i][j].activated === true)
                        {
                            //modify the table to display the deactivated sound
                            ctx.fillStyle = 'rgb(33, 33, 34)'
                            ctx.fillRect(xOrigin*100, yOrigin*50, 98, 48)

                            soundGridArr[i][j].deactivate();
                        }

            }
        }
    })

    //play button area
    playBtn = document.getElementById('playIcon')
    let requestId;
    xPos = 99
    inferiorLimit = 0
    function traverseGrid(){
        drawCanvas()
        putSamplesOnGrid()
        ctx.beginPath()
        ctx.strokeStyle = 'rgb(106, 242, 65)'
        ctx.moveTo(xPos, 0)
        ctx.lineTo(xPos, canvas.height)
        ctx.stroke()

        
        if(inferiorLimit < xPos && xPos < inferiorLimit+100)
        {

        } else
        {
            inferiorLimit = inferiorLimit + 100
            let index = Math.floor(xPos/100)
            for(let j = 0; j<samplesNo; j++)
            {
                if(soundGridArr[j][index].activated == true)
                {
                    soundGridArr[j][index].produceSound()
                    //console.log('for j=' + j + ': true')
                }
            }
        }

        //how long does it take for a beat to be played, based on the tempo
        secondsForABeat = 60/tempoVar
        //1beat - takes a space of 100px on the canvas table
        //requestAnimationFrame refreshes every 0.017 seconds
        //step = how many pixels are needed to be traversed in 0.017 seconds, so that a beat (100px) is finished (traversed) in the respective time (secondsForABeat)
        step = (100*0.017)/secondsForABeat

        xPos = xPos + step
        if(xPos <= 1700)
            requestId = requestAnimationFrame(traverseGrid)
        else {
            playBtn.classList.remove("bi-pause")
            playBtn.classList.add("bi-play")
            xPos = 99
            inferiorLimit = 0
            cancelAnimationFrame(requestId)
        }
    }
    playBtn.addEventListener('click', () => {

        console.log(playBtn.classList)
        if(playBtn.classList.contains("bi-play"))
        {
            playBtn.classList.remove("bi-play")
            playBtn.classList.add("bi-pause")

            requestId = requestAnimationFrame(traverseGrid)

        } else if(playBtn.classList.contains("bi-pause"))
        {
            playBtn.classList.remove("bi-pause")
            playBtn.classList.add("bi-play")
            cancelAnimationFrame(requestId)
        }
    })

    resetBtn = document.getElementById('resetIcon')
    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(requestId)
        xPos = 99
        inferiorLimit = 0
        playBtn.classList.remove("bi-pause")
        playBtn.classList.add("bi-play")
        drawCanvas()
        for(let i = 0; i<8; i++)
        {
            soundGridArr[i][0] = -1
        }
        for(let i = 0; i<8; i++)
            for(let j = 1; j<17; j++)
            {
                soundGridArr[i][j].deactivate()
            }
        samplesNo = 0
    })

    lpfBtnArray = document.getElementsByClassName('lowPassFilter')
    for(let i = 0; i<lpfBtnArray.length; i++)
    {
        lpfBtnArray.item(i).addEventListener('change', (e) => {
            if(e.target.checked)
            {
                effectsOnSamples[i].lowPassOn = true
            } else {
                effectsOnSamples[i].lowPassOn = false
            }
        })
    }

    hpfBtnArray = document.getElementsByClassName('highPassFilter')
    for(let i = 0; i<hpfBtnArray.length; i++)
    {
        hpfBtnArray.item(i).addEventListener('change', (e) => {
            if(e.target.checked)
            {
                effectsOnSamples[i].highPassOn = true
            } else {
                effectsOnSamples[i].highPassOn = false
            }
        })
    }
    
    plBtnArray = document.getElementsByClassName('panLeft')
    for(let i = 0; i<plBtnArray.length; i++)
    {
        plBtnArray.item(i).addEventListener('change', (e) => {
            if(e.target.checked)
            {
                effectsOnSamples[i].panLeft = true
            } else {
                effectsOnSamples[i].panLeft = false
            }
        })
    }

    prBtnArray = document.getElementsByClassName('panRight')
    for(let i = 0; i<prBtnArray.length; i++)
    {
        prBtnArray.item(i).addEventListener('change', (e) => {
            if(e.target.checked)
            {
                effectsOnSamples[i].panRight = true
            } else {
                effectsOnSamples[i].panRight = false
            }
        })
    }

    function drawCanvas() {

        //clear previous canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        //draw the new canvas
        spacing = 50
        ctx.lineWidth = 2
        for(let i = 0; i<canvas.height; i=i+50)
        {   
            ctx.beginPath()
            ctx.strokeStyle = 'white'
            ctx.moveTo(0, i)
            ctx.lineTo(canvas.width, i)
            ctx.stroke()
        }

        for(let i = 0; i<canvas.width; i=i+100)
        {   
            ctx.beginPath()
            ctx.strokeStyle = 'white'
            ctx.moveTo(i, 0)
            ctx.lineTo(i, canvas.height)
            ctx.stroke()
        }

        ctx.strokeStyle = 'black'
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
    }

    function initSoundGrid() {
        for(let i =0; i<8; i++)
            soundGridArr[i] = new Array(17).fill(-1)

        for(let i =0; i<8; i++)
            for(let j = 1; j<17; j++)
            {
                soundGridArr[i][j] = new SoundItem(false)
            }
            
    }

    function putSamplesOnGrid(){
        if(samplesNo > 0)
        {   
            for(let i= 0; i<samplesNo; i++)
            {
                ctx.fillStyle = 'rgb(53, 53, 223)'
                ctx.fillRect(0, i*50, 98, 48)
                ctx.fillStyle = 'yellow'
                ctx.font = '16px Arial'
                let text;
                let  sampleIndex = soundGridArr[i][0]

                if(sampleIndex == 0)
                {
                    text = 'Kick'
                    ctx.fillText(text, 70/2, i*(50-2)+28)
                } else if(sampleIndex == 1)
                {
                    text = 'Snare'
                    ctx.fillText(text, 70/2, i*(50-2)+28)
                } else if(sampleIndex == 2)
                {
                    text = 'Closed Hat'
                    ctx.fillText(text, 30/2, i*(50-2)+28)
                } else if(sampleIndex == 3)
                {
                    text = 'Clap'
                    ctx.fillText(text, 70/2, i*(50-2)+28)
                } else if(sampleIndex == 4)
                {
                    text = 'Hi-Hat'
                    ctx.fillText(text, 70/2, i*(50-2)+28)
                } else if(sampleIndex == 5)
                {
                    text = 'Open Hat'
                    ctx.fillText(text, 30/2, i*(50-2)+28)
                } else if(sampleIndex == 6)
                {
                    text = 'Rim-shot'
                    ctx.fillText(text, 30/2, i*(50-2)+28)
                }  else if(sampleIndex == 7)
                {
                    text = 'Ride Cymbal'
                    ctx.fillText(text, 8/2, i*(50-2)+28)
                } 
                               
            }

            for(let i = 0; i<samplesNo; i++)
                for(let j = 1; j<17; j++)
                {
                    if(soundGridArr[i][j].activated == true)
                    {
                        ctx.fillStyle = 'rgb(246, 196, 198)'
                        ctx.fillRect(j*100, i*50, 98, 48)
                    }
                }
        }
    }

}