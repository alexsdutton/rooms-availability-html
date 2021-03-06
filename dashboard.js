$(function() {
    var query = "https://data.ox.ac.uk/sparql/?query=SELECT+%3Faccount+%3FresourceLabel+%3FfloorplanPart+%3Ffloorplan+WHERE+%7B%0D%0A++%3Faccount+foaf%3AaccountServiceHomepage+%3Chttps%3A%2F%2Fnexus.ox.ac.uk%2F%3E+.%0D%0A++%3Fresource+foaf%3Aaccount+%3Faccount+.%0D%0A++%3Fresource+dc%3Atitle+%3FresourceLabel+.%0D%0A++%3Fresource+spatialrelations%3Awithin+%3Chttp%3A%2F%2Foxpoints.oucs.ox.ac.uk%2Fid%2F23233672%3E%0D%0A++OPTIONAL+%7B%0D%0A++++%3Fresource+adhoc%3AfloorplanPart+%3FfloorplanPart+.%0D%0A++++%3FfloorplanPart+%5Edcterms%3AhasPart%2B+%3Ffloorplan+.%0D%0A++++%3Ffloorplan+a+adhoc%3AFloorplanImage+.%0D%0A++%7D%0D%0A%7D&format=srj&common_prefixes=on";
    
    var availableRooms = [];
    var rooms = [];
    var floorplans = {};
    
    var width = 500,
        height = 500,
        div = d3.select('#matrix'),
        svg = div.append('svg')
            .attr('width', width)
            .attr('height', height),
        rw = 50,
        rh = 50;
    
        var data = [];
        for (var k = 0; k < 10; k += 1) {
            data.push(d3.range(3));
        }
        
        var grp = svg.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function(d, i) {
                return 'translate(0, ' + (rh + 5) * i + ')';
            });
            
            grp.selectAll('rect')
                .data(function(d) { return d; })
                .enter()
                .append('rect')
                    .attr('x', function(d, i) { return (rw + 5) * i; })
                    .attr('width', rw)
                    .attr('height', rh);
    
    function processRoom(room) {
        var endpoint = "http://127.0.0.1:8080/availability?email=";
        
        $.ajax(endpoint+room.email, {
            dataType: "json",
            context: this,
            success: function(data) {
                var periods = data.busyPeriods.periods;
                var now = moment();
                var busy = false;
                var ps = [];
                for (var i in periods) {
                    var period = periods[i];
                    // 2013-11-01T10:00:00GMT
                    var format = "YYYY-MM-DD'T'HH:mm:ssZ";
                    var fromMoment = moment(period.from, format);
                    var toMoment = moment(period.to, format);
                    var now = false;
                    if (fromMoment.isAfter(now) && toMoment.isBefore(now)) {
                        busy = true;
                        now = true;
                    }
                    ps.push({from: fromMoment, to: toMoment, now: now});
                }
                var r = {};
                r.name = room.name;
                r.email = room.email;
                r.busy = busy;
                r.periods = ps;
                console.log(r);
                rooms.push(r);
            }
        });
    }
    
    function processRooms() {
        console.log(availableRooms);
        for (var index in availableRooms) {
            var room = availableRooms[index];
            processRoom(room);
        }
        
        console.log(rooms);
    }

    function processFloorplans() {
        for (var url in floorplans) {
xhr = new XMLHttpRequest();
xhr.open("GET",url,false);
//xhr.overrideMimeType("image/svg+xml");
xhr.send("");
document.getElementById("floorplans")
  .appendChild(xhr.responseXML.documentElement);
        }
    }
    
    $.ajax(query, {
        context: this,
        success: function(data) {
            var resources = data.results.bindings;
            var div = $("#rooms");
            for (var index in resources) {
                var resource = resources[index];
                var mailto = resource.account.value;
                var email = mailto.split(":")[1];
                var title = resource.resourceLabel.value;
                //rooms += title + ", ";
                //var room = $("<h2>"+title+"</h2><div data-room-email='" + email + "'></div>")
                //div.append(room);
                //
                if (resource.floorplan)
                    floorplans[resource.floorplan.value] = true;
                availableRooms.push({name: title, email: email, floorplanPart: resource.floorplanPart ? resource.floorplanPart.value : undefined});
            }
            processFloorplans();
            processRooms();
        }
    });
    
    
    
});
