let survey = {};
let selectionQueryHTML = "";
let querySelectionQueryHTML = "";
let queryCodeHTML = "";
let tests = new Map();
tests.set("destination", {
    name: "Узнай и реализуй своё предназначение!",
    path: "source/test.json"
});
tests.set("motivator", {
    name: "Тест-упражнение «Мотиватор24»",
    path: "source/perfectCompanion.json"
});
let num = [
    "одного",
    "двух",
    "трех",
    "четырех",
    "пяти",
    "шести",
    "семи",
    "восьми",
    "девяти",
    "десяти",
    "одинадцати",
];
let view = false;
let createSelectorQuery = (query) => {
    let str = queryCodeHTML;
    view = false;
    str = str.replace("${thisQuery}",  Cookies.get('thisQuery'));
    str = str.replace("${countQuery}",  survey.test.length);
    str = str.replace("${titleQuery}",  query.title);
    str = str.replace("${info}",  query.info);
    let descriptionArr = query.description
        .replace("${count}", `<span class="alert-success">${num[query.count-1]}</span>`)
        .split("\n\n");
    let description = "";
    for (let i = 0; i < descriptionArr.length; i++)
    {
        if (descriptionArr[i].length > 0)
            description += $("<p>", {
                style: descriptionArr[i][0] === '-' ? "padding-left: 30px" : "",
                html:  descriptionArr[i]
            })[0].outerHTML;
    }
    str = str.replace("${descriptionQuery}",  description);

    let selectionQuery = "";


    for (let i = 0; i < query.selection.length; i++) {
        let querySelect = querySelectionQueryHTML;
        querySelect = querySelect.replace("${query}", query.selection[i].query);
        querySelect = querySelect.replace("${queryId}", i);
        let selectors = "";
        for (let j = 0; j < query.selection[i].selection.length; j++) {
            let selectionHtml = selectionQueryHTML;
            selectionHtml = selectionHtml.replace("${inputType}", query.selection[i].count > 1 ? "checkbox" : "radio");
            selectionHtml = selectionHtml.replace("${text}", query.selection[i].selection[j].select);
            selectionHtml = selectionHtml.replace("${selectionId}", i);
            selectionHtml = selectionHtml.replace("${code}", query.selection[i].selection[j].description);
            selectors += selectionHtml;
        }
        querySelect = querySelect.replace("${selectionQuery}", selectors);
        selectionQuery += querySelect;
    }
    str = str.replace("${selectionQuery}",  selectionQuery);
    return str.replace("Дальше", "Узнать рузультат");
}
let createCodeQuery = (query) => {
    let str = queryCodeHTML;
    str = str.replace("${thisQuery}",  Cookies.get('thisQuery'));
    str = str.replace("${countQuery}",  survey.test.length);
    str = str.replace("${titleQuery}",  query.title);
    let descriptionArr = query.description
        .replace("${count}", `<span class="alert-success">${num[query.count-1]}</span>`)
        .split("\n\n");
    let description = "";
    for (let i = 0; i < descriptionArr.length; i++)
    {
        if (descriptionArr[i].length > 0)
            description += $("<p>", {
                style: descriptionArr[i][0] === '-' ? "padding-left: 30px" : "",
                html:  descriptionArr[i]
            })[0].outerHTML;
    }
    str = str.replace("${descriptionQuery}",  description);
    let selection = "";
    for (let i = 0; i < query.selection.length; i++)
    {
        let selectionHtml = selectionQueryHTML;
        selectionHtml = selectionHtml.replace("${inputType}", query.count > 1 ? "checkbox" : "radio");
        selectionHtml = selectionHtml.replace("${text}", query.selection[i].text);
        selectionHtml = selectionHtml.replace("${selectionId}", i);
        selectionHtml = selectionHtml.replace("${code}", query.selection[i].code);
        selection += selectionHtml;
    }
    str = str.replace("${selectionQuery}",  selection);
    return str;
};
let createMultiSelector = (query) => {
    let html = queryCodeHTML
        .replace("${thisQuery}",  Cookies.get('thisQuery'))
        .replace("${countQuery}",  survey.test.length)
        .replace("${titleQuery}",  query.title);
    let descriptionArr = query.description
        .replaceAll("${count}", `<span class="alert-success">одну</span>`)
        .split("\n\n");
    let description = "";
    for (let i = 0; i < descriptionArr.length; i++)
    {
        if (descriptionArr[i].length > 0)
            description += $("<p>", {
                style: descriptionArr[i][0] === '-' ? "padding-left: 30px" : "",
                html:  descriptionArr[i]
            })[0].outerHTML;
    }
    html = html.replace("${descriptionQuery}",  description);
    let topics = "";
    for (let i = 0; i < query.topics.length; i++){
        topics += `<div class="col-xs-12 mt-7"><h4>${query.topics[i]}</h4></div> `;
        for (let j = 0; j < query.selection[i].length; j++)
        {
            topics += selectionQueryHTML
                .replace("${inputType}", "radio")
                .replace("${text}", query.selection[i][j].text)
                .replace("${selectionId}", `${i}`)
                .replace("${code}", query.selection[i][j].code);
        }
    }
    return html.replace("${selectionQuery}", topics);
};
let typeQueryProcessing = new Map([
    ['code', createCodeQuery],
    ['selector', createSelectorQuery],
    ['multiSelector', createMultiSelector]
]);

let checkCodeProcessing = (query) => {
    let count = $(':checkbox:checked').length;
    if (count > query.count){
        swal('', `Нужно не больше ${num[query.count-1]} пунктов`, "warning");
        return false;
    }
    if (count === 0){
        swal('', `Выберите хотя бы один пункт`, "warning");
        return false;
    }
    $('input:checkbox:checked').each(function(){
        let code = parseInt($(this).val());
        Cookies.get(`code-${code}`) ?
            Cookies.set(`code-${code}`, parseInt(Cookies.get(`code-${code}`))+1) :
            Cookies.set(`code-${code}`, 0);
    });
    return true;
};
let checkSelectionProcessing = () => {
    let names = [];
    let result = view;
    view = true;
    $("input").each((i, el) => {
       if (names.indexOf(el.name) === -1) names.push(el.name);
    });
    for (let i = 0; i < names.length; i++){
        let selected = $(`input:checked[name=${names[i]}]`);
        let alertSelector = `#q-d-${names[i].substr(4)}`;
        if (selected.length === 0) {
            view = false;
            $(alertSelector).text("Выбирите значение");
            $(alertSelector).addClass("alert-danger");
            $(alertSelector).removeClass("alert-success");
            $(alertSelector).removeClass("hidden");
        } else {
            $(alertSelector).html(selected[0].value);
            $(alertSelector).removeClass("alert-danger");
            $(alertSelector).addClass("alert-success");
            $(alertSelector).removeClass("hidden");
        }
        console.log(selected.length);
    }
    if (result) $(document).scrollTop(0);
    $($("body")[0]).html($("body")[0].html().replace("Узнать результат", "Вернуться на главную"));
    if (!view) swal('Ошибка', `Нужно ответить на все вопросы`, "warning");
    if (result && view) return  document.location.href = document.location.href.replace(/\?*test=[a-z0-9]*/gi, "");
    return result && view;
};
let checkMultiSelector = (query) => {
    for (let i = 0; i < query.topics.length; i++){
        let select = $(`input[name=q-n-${i}]:checked`);
        if (select.length === 0) {
            swal('', `В каждой теме нужно выбрать по одному пункту`, "warning");
            return false;
        }
    }
    for (let i = 0; i < query.topics.length; i++){
        let code = parseInt($(`input[name=q-n-${i}]:checked`).val());
        Cookies.get(`code-${code}`) ?
            Cookies.set(`code-${code}`, parseInt(Cookies.get(`code-${code}`))+1) :
            Cookies.set(`code-${code}`, 0);
    }
    return true;
};
let typeCheckProcessing = new Map ([
    ['code', checkCodeProcessing],
    ['selector', checkSelectionProcessing],
    ['multiSelector', checkMultiSelector]
]);

let getTestPromise = new Promise((resolve, reject) => {
    let source = tests.get(GET("test"));
    console.log(source);
    if (source){
        $.getJSON(source.path)
            .done(function( json ) {
                survey = json;
                resolve(json);
            })
            .fail((jqxhr, textStatus, error) => reject(error));
    }

});
let getSelectionHtmlPromise = new Promise((resolve, reject) => {
    $.get("source/selectionQuery.html")
        .done(html => {
            resolve(html);
        })
        .fail((jqxhr, textStatus, error) => reject(error))
});
let getQuerySelectionHtmlPromise = new Promise((resolve, reject) => {
    $.get("source/querySelectionQuery.html")
        .done(html => {
            resolve(html);
        })
        .fail((jqxhr, textStatus, error) => reject(error))
});
let getQueryCodeHtmlPromise = new Promise((resolve, reject) => {
    $.get("source/query_code.html")
        .done(html => {
            resolve(html);
        })
        .fail((jqxhr, textStatus, error) => reject(error))
});

function next() {
    let thisQuery = parseInt(Cookies.get('thisQuery')) -1;
    if (thisQuery < 0) Cookies.set("thisQuery", 0);
    if (survey.test.length > thisQuery){
        if (typeCheckProcessing.get(survey.test[thisQuery].type)(survey.test[thisQuery])){
            Cookies.set('thisQuery', thisQuery + 2);
            drowQuery();
        }
    }
    else {
        if (thisQuery === survey.test.length){
            showResult();
        }
    }

}
function showResult() {
    $("#query-draw").detach();
    if (typeof Ya !== "undefined")
    {
        let canvas = document.createElement("canvas");
        let resultWrap = $("#query-result");
        $(canvas).attr("id", "resultChart");
        $(canvas).attr("height", $(resultWrap).width()/2);
        $(canvas).attr("width", $(resultWrap).width());
        let summa = 0;
        let codeSummator = [];
        for (let i = 1; i <= 12; i++){
            codeSummator.push(parseInt(Cookies.get(`code-${i}`)));
            summa += parseInt(codeSummator[i-1]);
        }
        let dataset = [];
        for (let i = 0; i < 12; i++) {
            dataset.push(codeSummator[i] * 100 / summa);
        }
        let myChart = new Chart(canvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: [
                    'Продолжатель-семьянин',
                    'Оптимист',
                    'Стратег',
                    'Благодаритель',
                    'Созерцатель',
                    'Программист',
                    'Идеал',
                    'Командир',
                    'Инвестор',
                    'Авторитет-старожил',
                    'Реализатор-хозяйственник',
                    'Гений-магнит места'
                ],
                datasets: [{
                    label: "Персональный профиль предназначения",
                    data: dataset,
                    backgroundColor: [
                        'rgba(92,184,92,0.2)'
                    ],
                    borderColor: [
                        'rgb(92,184,92)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                scale: {
                    ticks: {
                        beginAtZero: true
                    }
                }
            }
        });
        $("#dataset").append(canvas);
        $("#query-result").removeClass("hidden");
        let panels = [];
        $.getJSON( "source/testDescription.json")
            .done(testDescription => {
                $.get( "source/panel.html")
                    .done(panel => {

                        for (let i = 0; i < testDescription.testDescription.length; i++){
                            if (codeSummator[i]){
                                let tableBody = "";
                                for (let j = 0; j < testDescription.testDescription[i].decryption.length; j++) {
                                    let tableRow= $("<tr>");
                                    $(tableRow).append($("<td>").text(
                                        testDescription
                                            .destination[j]
                                    ));
                                    $(tableRow).append($("<td>").text(
                                        testDescription
                                            .testDescription[i]
                                            .decryption[j]
                                    ));
                                    tableBody += tableRow[0].outerHTML;
                                }
                                panels.push({
                                        percent: dataset[i],
                                        html: panel
                                            .replace("${head}", `${testDescription.testDescription[i].name} на ${Math.round(dataset[i])}%`)
                                            .replaceAll("${id}", testDescription.testDescription[i].id)
                                            .replace("${body}", testDescription.testDescription[i].description)
                                            .replace("${tbody}", tableBody)
                                            .replaceAll("\n\n","<br>")
                                });
                            }
                        }
                        panels.sort((a, b) => {
                            if (a.percent > b.percent) return -1;
                            if (a.percent < b.percent) return 1;
                            return 0;
                        });
                        for (let i = 0; i < panels.length; i++){
                            $("#accordion").append(panels[i].html);
                        }

                    })
                    .fail((jqxhr, textStatus, error) => console.log(error));
            })
            .fail((jqxhr, textStatus, error) => console.log(error));
        Ya.share2('shareYa', {
            theme: {
                services: 'vkontakte,facebook,odnoklassniki,twitter,tumblr,viber,whatsapp',
            },
            content: {
                url: "анодимси.рф/testy",
                title: survey.title,
                description: "",
                services: "vkontakte,facebook,odnoklassniki,twitter,tumblr,viber,whatsapp",
                image: "https://blog.casebook.ru/wp-content/uploads/2017/10/photodune-4347985-choose-direction-m.jpg"
            }
        });
    } else {
        swal('Ошибка', `Отключите блокировку виджитов социальных сетей чтобы увидеть результат!`, "error");
    }
    $("#loader").addClass("hidden");
}
function beginAgain() {
    Cookies.remove('thisQuery', null);
    for (let i = 1; i <= 12; i++){
        Cookies.set('code-' + i, 0);
    }
    document.location.reload();
}
function drowQuery(){
    if (parseInt(Cookies.get('thisQuery')) - 1 >= survey.test.length){
        next();
        return false;
    }
    $("#loader").removeClass("hidden");
    $("#query-draw").addClass("hidden");

    let thisQuery = parseInt(Cookies.get('thisQuery')) -1;

    let query = typeQueryProcessing
        .get(survey.test[thisQuery].type)
        (survey.test[thisQuery]);

    $("#query-draw").html(query);


    $("#query-draw").removeClass("hidden");
    $("#loader").addClass("hidden");
    $(window).scrollTop(0);
}

$( document ).ready(() => {
    if (GET("redirect")){
        $($(".container")[0]).addClass("container-fluid");
        $($(".container-fluid")[0]).removeClass("container");
        $($(".container-fluid")[0]).css("padding", 0);
        $($("#query-draw")[0]).css("margin", 0);
        $($("#query-draw")[0]).css("border", "none");
        $($("#query-result")[0]).css("margin", 0);
        $($("#query-result")[0]).css("border", "none");
    }
    if (GET("test")){
        Promise.all([
            getTestPromise,
            getSelectionHtmlPromise,
            getQueryCodeHtmlPromise,
            getQuerySelectionHtmlPromise
        ]).then(result => {
            survey = result[0];
            selectionQueryHTML = result[1];
            queryCodeHTML = result[2];
            querySelectionQueryHTML = result[3];
            if (Cookies.get('thisQuery') === "-1"){
                $("#loader").addClass("hidden");
                $("#query-draw").append(`<h2 class='text-center'>${survey.title}</h2>`);
                let description = survey.description.split("\n\n");
                for (let i = 0; i < description.length; i++){
                    $("#query-draw").append(`<span style="font-size: 14px; padding: 0 30px;">${description[i]}</span><br>`);
                }
                $("#query-draw").append("<p class='text-center'><span onclick='startTest()' class='btn btn-success'>Начать тест</span></p>");
                console.log(survey);
                $("#query-draw").removeClass("hidden");
            } else drowQuery();
        })
        .catch(err => {
            console.log(err);
        })
    } else {
        for (let i = 1; i <= 12; i++){
            Cookies.set(`code-${i}`, 0);
        }
        Cookies.set('thisQuery', -1);
        $("#loader").addClass("hidden");
        tests.forEach((value, key) => {
            $("#query-draw").append(`<p class='text-center'><a href='${document.location.href + GET("redirect")? "?" : "&"}test=${key}' class='btn btn-success'>${value.name}</a></p>`);
        });
        $("#query-draw").removeClass("hidden");
    }

});

function startTest(){
    for (let i = 1; i <= 12; i++){
        Cookies.set(`code-${i}`, 0);
    }
    Cookies.set('thisQuery', 1);
    drowQuery();
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
function GET(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}
