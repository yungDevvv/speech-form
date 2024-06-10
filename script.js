document.addEventListener('DOMContentLoaded', function () {
    // Tarkistetaan Web Speech API:n tuki
    if (!('webkitSpeechRecognition' in window)) {
        alert("Selaimesi ei tue Web Speech API:ta.");
        return;
    }

    // Haetaan ainoastaan input ja textarea kentät
    const formElements = document.querySelectorAll('#voice-form input, #voice-form textarea');
    const formVoiceSVGs = document.querySelectorAll('#voice-form svg#voiceSVG');
    const startSpeechButton = document.getElementById("startSpeechButton");

    formVoiceSVGs.forEach(svg => svg.addEventListener("click", (e) => {
        e.preventDefault();
        // Tarkistetaan, onko puhetunnistus jo käynnissä
        if (recognition.isStarted) {
            alert("Täytä ensin kenttä loppuun!");
            return;
        }

        const label = e.currentTarget.closest("label");
        const input = label.querySelector("input");
        const textarea = label.querySelector("textarea");

        // Asetetaan aktiivinen kenttä iconille klikkaessa
        if (input) recognition.activeFieldIndex = input.tabIndex - 1;
        if (textarea) recognition.activeFieldIndex = textarea.tabIndex - 1;

        startSpeechButton.innerText = "Seuraava kenttä";
        recognition.start();
        recognition.isStarted = true;
    }));

    const originalInputStyle = window.getComputedStyle(formElements[0]); // Tallennetaan inputin kaikki alkuperäiset tyylit

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'fi-FI';
    recognition.activeFieldIndex = 0;
    recognition.isStarted = false;

    // Funktio siirtyä seuraavaan kenttään
    recognition.nextfield = function () {
        if (!formElements[recognition.activeFieldIndex + 1]) {
            // Tarkistetaan että onko olemassa seuraavaa elementtiä
            recognition.activeFieldIndex = 0;
            startSpeechButton.innerText = "Aloita äänisyöttö"
        } else {
            recognition.activeFieldIndex += 1;
            if (formElements[recognition.activeFieldIndex].type === "email") {
                // Ohitetaan email-tyyppiset kentät
                recognition.activeFieldIndex += 1;
            }
        }
    }


    recognition.onstart = function () {
        console.log("Puhetunnistus alkoi!");

        // Haetaan aktiivinen kentän ja iconin
        let currentInput = formElements[recognition.activeFieldIndex];
        let currentSVG = Array.from(formVoiceSVGs).find(svg => svg.getAttribute('data-index') - 1 === recognition.activeFieldIndex);
        // Asetetaan aktiiviselle kentälle ja iconille active tyylit
        currentSVG.setAttribute("fill", "red")
        currentInput.style.border = "2px solid red"
    };

    // Kun tulos saadaan puhetunnistuksesta
    recognition.onresult = function (event) {
        let final_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            }
        }

        // Erityiskäsittely puhelinnumeroille
        if (formElements[recognition.activeFieldIndex].type === "tel") {
            // Poistetaan turhat välilyönnit jotka saattavat tulla välillä
            formElements[recognition.activeFieldIndex].value = final_transcript.replace(/\s+/g, '');
            recognition.stop();
            return;
        }

        // Asetetaan tunnistettu teksti aktiiviseen kenttään
        if (formElements[recognition.activeFieldIndex]) {
            // Vaihdetaan sanat "piste", "pilkku", "kysymysmerkki", "huutomerkki" sanat oikeihin merkkeihin
            formElements[recognition.activeFieldIndex].value = final_transcript.split(' ').join(" ").replace(/\s?piste\b/gi, '.').replace(/\s?pilkku\b/gi, ',').replace(/\s?huutomerkki\b/gi, '!').replace(/\s?kysymysmerkki\b/gi, '?');
            recognition.stop();
        }

    };

    recognition.onerror = function (event) {
        alert("Ongelma puhetunnistuksessa!");
        console.error("Ongelma puhetunnistuksessa: ", event.error);
    };

    
    recognition.onend = function () {
        console.log("Puhetunnistus loppui!");

        // Haetaan aktiivinen kentän ja iconin
        let currentInput = formElements[recognition.activeFieldIndex];
        let currentSVG = Array.from(formVoiceSVGs).find(svg => svg.getAttribute('data-index') - 1 === recognition.activeFieldIndex);

        // Asetetaan perus tyylit takaisin
        currentSVG.setAttribute("fill", "currentColor")
        currentInput.style = originalInputStyle;

        recognition.nextfield();
        recognition.isStarted = false;
    };
    
    startSpeechButton.addEventListener("click", (e) => {
        if (recognition.isStarted) {
            alert("Täytä ensin kenttä loppuun!");
            return;
        }
        startSpeechButton.innerText = "Seuraava kenttä";
        recognition.start();
    })
});
