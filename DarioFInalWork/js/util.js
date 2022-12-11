function calcLocationToData(selectedData){
    const groupByLocation = d3.group(selectedData, row => row["location"]);
    const ret = {};
    for(let [location, data] of groupByLocation)
    {
        ret[location] = data
        .map(row => row["total_vaccinations"])
        .reduce((p, c) => p + c);
    }
    return ret;
}

function makeNumberToColor(locationToTotal, baseColor)
{
    // 计算locationToTotal数量到颜色的转换函数
    baseColor = d3.color(baseColor);

    let numbers = Object.values(locationToTotal).sort((a, b)=>a-b);
    let min = d3.min(numbers);
    let max = d3.max(numbers);

    return d3.scaleLog()
        .domain([min, max])
        .range([
            baseColor.darker(1),
            baseColor.brighter(1),
        ])
}



///////////////

function appendOptionToSelect(selectSel, options)
{
    selectSel
    .selectAll("NONE")
    .data(options)
    .enter()
    .append("option")
    .text(e=>e)
}

///////
function makeHover(getNumber)
{
    let fmtByThousands = d3.format(",");
    return function(sel)
    {
        let tip;
        sel.on('mouseover', function(e){
            let thisData = this.__data__;
            let location = thisData._fig_location;

            let showNumber = getNumber(location);
            showNumber = showNumber ? showNumber : 0;

            let offX = e.pageX;
            let offY = e.pageY + 20;

            d3.select(this)
            .attr('stroke', 'red');

            tip = d3.select('body')
            .append('div')
            .attr('id', 'tip')
            .style('left', offX+'px')
            .style('top', offY+'px');
            
            tip.append('p')
            .text(location)

            tip.append("p")
            .text(fmtByThousands(showNumber))

        })
        .on('mousemove', function(e){
            let offX = e.pageX + 20;
            let offY = e.pageY;

            tip
            .style('left', offX+'px')
            .style('top', offY+'px');
        })
        .on('mouseout', function(e){
            d3.select(this)
            .attr('stroke', undefined);

            tip.remove();
        })
    }
}

function makeRotate(projection, geoGenerator, contries)
{
    return function(sel)
    {
        let [bx, by] = [0, 0];
        let scale = 300;

        sel
        .call(
            d3.drag()
            .on("drag",function(e){
                bx += e.dx * 100 / scale;
                by += e.dy * 100 / scale;
                projection.rotate([bx, -by, 0]);
                contries.attr("d", p => geoGenerator(p));
            })
        )

        sel
        .on("mousewheel", function(e){
            scale += e.wheelDelta / 10;
            projection.scale(scale)
            contries.attr("d", p => geoGenerator(p));
        })
    }
}