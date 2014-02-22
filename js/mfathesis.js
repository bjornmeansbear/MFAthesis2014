$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,$('header img.backgroundfill').length)+')').show();
  
  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    var showdates = [{
      name: ["Post Bac FA"],
      date: '1/31/2014'
    }, {
      name: ["Graphic Design", "Post Bac GD", "Illustration Practice"],
      date: '3/28/2014'
    }, {
      name: ["Social Design"],
      date: '4/23/2014'
    }, {
      name: ["Rinehart", "Photo & Electronic Media", "Community Arts", "Photo & Electronic Media"],
      date: '4/11/2014'
    }, {
      name: ["MA Teaching"],
      date: '1/24/2014'
    }, {
      name: ["Mount Royal","Hoffberger"],
      date: '4/25/2014'
    }, {
      name: ['Curatorial'],
      date: 'Not available'
    }, {
      name: ["Critical Studies"],
      date: '5/3/2014'
    }];
    var showDate = function(program) {
      var showdate = '';
      var shows = this;
      for (var i = 0; i<shows.length; i++) {
        if (_.indexOf(shows[i].name, program) > -1) {
          showdate = shows[i].date;
        }
      }
      return showdate;
    }
    _.map(data.students, function(student) {
      student.showdate = _.bind(showDate, showdates, student.program);
    });
    var StudentTemplate = Hogan.compile($('#students-template').html());
    var StudentOverlay = Hogan.compile($('#overlay-template').html());
    $('#projects-demo').html(StudentTemplate.render(data));

    var options = {
      valueNames: [ 'name', 'program', 'exhibitionlocation', 'showdate', 'id' ]
    };

    var studentlist = new List('students', options);
    studentlist.on('updated', function() {
      $('li.student').each(function(i,obj) {
        var id = $(this).find('p.id').html();
        $(this).off('click touch').on('click touch', function(e) {
          var s = studentlist.get('id', id)[0].values();
          var pos = document.body.scrollTop;
          $('body').append(StudentOverlay.render(s));
          $('html,body').css('overflow','hidden').height($(window).height());
          $('.student-overlay button.close').on('click touch', function(e) {
            $('html,body').css('overflow','auto').css('height', '');
            $('body').animate({ scrollTop: pos }, 0);
          });
        });
      });
    });
    studentlist.sort('name', { order: 'asc' });
    studentlist.filter(function(item) {
      return item.values().name.length > 1;
    });
    $('#gallery-filter a').on('click touch', function(e) {
      e.preventDefault();
      var gallery = $(this).data('gallery');
      studentlist.filter(function(item) {
        return item.values().exhibitionlocation.toLowerCase().indexOf(gallery.toLowerCase()) >= 0;
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
    $('#showdate-filter a').on('click touch', function(e) {
      e.preventDefault();
      var showdate = $(this).data('showdate');
      studentlist.filter(function(item) {
        return item.values().showdate.indexOf(showdate) >= 0;
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
    $('#program-filter a').on('click touch', function(e) {
      e.preventDefault();
      var program = $(this).data('program');
      studentlist.filter(function(item) {
        return item.values().program.indexOf(program) >= 0;
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
    $('a.sort-studentlist').on('click touch', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      if (type === 'program') {
        studentlist.filter();
        studentlist.sort('program', { sortFunction:  function(a,b) {
                                                      if(a.values().program< b.values().program) return -1;
                                                      if(a.values().program>b.values().program) return 1;
                                                      if(a.values().name<b.values().name) return -1;
                                                      if(a.values().name>b.values().name) return 1;
                                                      return 0;
                                                    }
        });
      } else if (type === 'all') {
        studentlist.filter();
        studentlist.filter(function(item) {
          return item.values().name.length > 1;
        });
        studentlist.sort('name', {order: 'asc'});
      }
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
  });
  
});


// Parallax Scrolling for the SiteName -->
$(window).scroll(function(){
  var s = $(window).scrollTop();
  $("header > img.backgroundfill").css("transform","translateY(" + (s*-1.075) + "px)");

  if (s >= 400) {
    $('header .ontop .pattern').addClass('sticky');
  }

  else {
    $('header .ontop .pattern').removeClass('sticky');
  }

});