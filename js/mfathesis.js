$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,$('header img.backgroundfill').length)+')').show();
  
  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    // Programs grouped by showdates as taken from the actual data
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

    // Function to convert a program into a showdate
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

    // Function for getting a list of other people in the same program
    var sameProgram = function(program) {
      var students = this;
      return _.sortBy(_.where(students, { program: program }), 'firstname');
    }

    // Map our showDate() function to a binding of showdates and the program name
    _.map(data.students, function(student) {
      student.showdate = _.bind(showDate, showdates, student.program);
      student.peers = _.bind(sameProgram, data.students, student.program);
    });

    // Compile templates for the list and the overlay
    var StudentTemplate = Hogan.compile($('#students-template').html());
    var StudentOverlay = Hogan.compile($('#overlay-template').html());
    
    // Render the template for the list and initialize list.js
    $('#projects-demo').html(StudentTemplate.render(data));
    var options = {
      valueNames: [ 'name', 'program', 'exhibitionlocation', 'showdate', 'id' ]
    };
    var studentlist = new List('students', options);
    
    // Things to do when the studentlist is updated
    studentlist.on('updated', function() {
      $('li.student').each(function(i,obj) {
        // Retrieve the id for the current list item
        var id = $(this).find('p.id').html();
        // Click handler for the list item
        $(this).off('click touch').on('click touch', function(e) {
          // Get the student information from the list
          var s = _.where(data.students, { id:id })[0];
          console.log(s);
          // Save the current scroll position
          var pos = document.body.scrollTop;
          // Append the overlay to the body
          $('body').append(StudentOverlay.render(s));
          // Set the window height to eliminate scrolling
          $('html,body').css('overflow','hidden').height($(window).height());
          // When we close the window, rest the body overflow and scroll position
          $('.student-overlay button.close').on('click touch', function(e) {
            $('html,body').css('overflow','auto').css('height', '');
            $('body').animate({ scrollTop: pos }, 0);
          });
        });
      });
    });
    // Initially, sort the list by ascending first name
    studentlist.sort('name', { order: 'asc' });
    // Filter out bad results
    studentlist.filter(function(item) {
      return item.values().name.length > 1;
    });

    // Search on input keyup
    $('input#search-students').on('keyup', function() {
      var search = $(this).val();
      if (search.length > 0) {
        studentlist.filter(function (item) {
          return item.values().name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
        });
      } else {
        studentlist.filter(function(item) {
          return item.values().name.length > 1;
        });
      }
    });
    // Process gallery filter
    $('#gallery-filter a').on('click touch', function(e) {
      e.preventDefault();
      var gallery = $(this).data('gallery');
      studentlist.filter(function(item) {
        return item.values().exhibitionlocation.toLowerCase().indexOf(gallery.toLowerCase()) >= 0;
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });

    // Process the showdate filter
    $('#showdate-filter a').on('click touch', function(e) {
      e.preventDefault();
      var showdate = $(this).data('showdate');
      studentlist.filter(function(item) {
        return item.values().showdate.indexOf(showdate) >= 0;
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });

    // Process the program filter 
    $('#program-filter a').on('click touch', function(e) {
      e.preventDefault();
      var program = $(this).data('program');
      studentlist.filter(function(item) {
        return item.values().program.indexOf(program) >= 0;
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });

    // Sorting methods
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