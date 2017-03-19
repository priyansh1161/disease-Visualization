var simData = {};
var nameToCode = {};

function mapMaker(areas,year) {
    var map = AmCharts.makeChart( "chartdiv", {

        type: "map",
        projection: "miller",
        // theme : 'dark',
        "allLabels": [
            {
                "text": `Deaths caused by TB in year ${year}`,
                "bold": true,
                align : 'center',
                "y": 20,
                size : 20
            }
        ],
        dataProvider: {
            map: "worldLow",
            areas
        },
        areasSettings: {
            "autoZoom": true,
            "selectedColor": "#CC0000"
        },

        smallMap: {},
        export: {
            "enabled": true,
            "position": "bottom-right"
        }
    });
}
function processData(year) {
    $('#chartdiv').fadeOut('slow',function(){
        var series = [];
        for(var key in simData[year]){
            series.push({
                id : key,
                value : simData[year][key].tValue,
                balloonText : `
                    [[title]],<br> 
                    Death Counts : [[value]]`,
                description : `<ul class="description"><li><b>${simData[year][key].GHO[0].name} </b>: ${simData[year][key].GHO[0].value}</li><br>
                    <br><li><b>${simData[year][key].GHO[0].name}</b> : ${simData[year][key].GHO[0].value}</li></ul>`,
            });
        }
        mapMaker(series,year);
        console.log('sda',series);
        $('#chartdiv').fadeIn('slow',function () {
        })
    });

}
function playProgressData(){
    for(let i=0;i<=15;i++) {
        let newYear = 2000 + i;
        setTimeout(function () {
            console.log(newYear);
            processData(newYear.toString());
            if(newYear === 2015)
                $('#play').attr('disabled',false);
        },4000*i)
    }
}
$('document').ready(()=>{
    for(var i =0;i<topo.length;i++){
        nameToCode[topo[i].Name] = topo[i].Code;
    }
    console.log(nameToCode);
    class simGen {
        constructor(obj){
            this.code = nameToCode[obj.dim.COUNTRY];
            this.name = obj.dim.COUNTRY;
            this.year = obj.dim.YEAR;
            let value = this.parseValue(obj);
            this.GHO = [{ name : obj.dim.GHO,value }];
            this.tValue = value;
        }
        parseValue(obj){
           return parseInt(obj.Value.split(' ')[0]);
        }
        pushGHO(obj) {
            this.GHO.push({name : obj.dim.GHO,value : this.parseValue(obj)});
            this.tValue +=this.parseValue(obj);
        }
    }
    const url = 'http://apps.who.int/gho/athena/data/GHO/MDG_0000000017,TB_e_mort_exc_tbhiv_num.json?profile=simple&filter=COUNTRY:*;REGION:*';
    $.ajax({
        method : 'GET',
        url,
        jsonp : true
    })
        .then((data)=>{
            console.log(data.fact);
            data.fact.forEach((curr)=> {
                var code = nameToCode[curr.dim.COUNTRY] || 'NONE';
                if(code==='NONE'){
                    console.log(curr.dim.COUNTRY);
                }
                // console.log('okay');
                if(!simData[curr.dim.YEAR]){
                    simData[curr.dim.YEAR] = {};
                    simData[curr.dim.YEAR][code] = new simGen(curr);
                }
                else {
                    if(simData[curr.dim.YEAR][code]){
                        simData[curr.dim.YEAR][code].pushGHO(curr);
                    }
                    else {
                        simData[curr.dim.YEAR][code] = new simGen(curr);
                    }
                }
            });
            processData('2000');
    })
        .catch(xhr => console.log(xhr));
    $('button').on('click',function (e) {
        var self = this;
        if($(this).html() === 'PLAY'){
            console.log('play');
            $(this).attr('disabled',true);
            return playProgressData();
        }
        processData($(self).html());
       
    });
});