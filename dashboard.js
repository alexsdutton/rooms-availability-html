$(function() {
    var query = "https://data.ox.ac.uk/sparql/?query=SELECT+%3Faccount+%3FresourceLabel+WHERE+%7B%0D%0A++%3Faccount+foaf%3AaccountServiceHomepage+%3Chttps%3A%2F%2Fnexus.ox.ac.uk%2F%3E+.%0D%0A++%3Fresource+foaf%3Aaccount+%3Faccount+.%0D%0A++%3Fresource+dc%3Atitle+%3FresourceLabel+.%0D%0A++%3Fresource+spatialrelations%3Awithin+%3Chttp%3A%2F%2Foxpoints.oucs.ox.ac.uk%2Fid%2F23233672%3E%0D%0A%7D&format=srj&common_prefixes=on";
    
    var rooms = [];
    
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
    
    function processRooms() {
        var endpoint = "http://127.0.0.1:8080/availability?email=";
        
        for (var index in rooms) {
            var room = rooms[index];
            $.ajax(endpoint+room.email, {
                dataType: "json",
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
                    room.busy = busy;
                    room.periods = ps;
                }
            });
        }
        
        console.log(rooms);
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
                rooms.push({name: title, email: email});
                //rooms += title + ", ";
                //var room = $("<h2>"+title+"</h2><div data-room-email='" + email + "'></div>")
                //div.append(room);
            }
            processRooms();
        }
    });
    
    
    
});