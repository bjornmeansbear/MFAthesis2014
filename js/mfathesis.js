$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,$('header img.backgroundfill').length)+')').show();
  
  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    // Programs grouped by showdates as taken from the actual data

    var showdates = [{
      name: ["Post Bac FA"],
      date: 'Jan 31-Feb 16, 2014'
    }, {
      name: ["Graphic Design", "Post Bac GD", "Illustration Practice"],
      date: 'Mar 28-Apr 06, 2014'
    }, {
      name: ["Social Design"],
      date: 'Apr 23-May 04, 2014'
    }, {
      name: ["Rinehart", "Photo & Electronic Media", "Community Arts"],
      date: 'Apr 11-Apr 20, 2014'
    }, {
      name: ["MA Teaching"],
      date: 'Jan 24-Feb 16, 2014'
    }, {
      name: ["Mount Royal","Hoffberger"],
      date: 'Apr 25-May 04, 2014'
    }, {
      name: ['Curatorial'],
      date: 'Feb 01-May 09, 2014'
    }, {
      name: ["Critical Studies"],
      date: 'May 03, 2014'
      // We are going to need to add Studio Art MFA - Jun 28-Jul 12, 2014, and Art Education MA - Jul 27-Aug 01, 2014
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
      program = (_.isUndefined(program)) ? '':program;
      program = program.replace('&amp;','&');
      return _.sortBy(_.where(students, { program: program }), 'firstname');
    }

    // Slideshow items
    var slideShow = function(id) {
      var slideshow = this;
      if (_.isUndefined(slideshow[id])) return [];
      return slideshow[id];
    }

    // Used for the indicators
    var slideShowcount = function(id) {
      var slideshow = this;
      var r = [];
      if (_.isUndefined(slideshow[id]) == false) {
        for (var i=0; i<slideshow[id].length; i++) {
          r.push(i);
        }
      }
      return r;
    }

    // Function to determine whether we have images for an id
    var slideShowimages = function(id) {
      var slideshow = this;
      var r = [];
      if (_.isUndefined(slideshow[id]) == false) {
        for (var i=0; i<slideshow[id].length; i++) {
          r.push(i);
        }
      }
      return r.length > 0;
    }

    // Function to determine whether we have images for an id
    var slideShowsingle = function(id) {
      var slideshow = this;
      var r = [];
      if (_.isUndefined(slideshow[id]) == false) {
        for (var i=0; i<slideshow[id].length; i++) {
          r.push(i);
        }
      }
      return r.length > 1;
    }

    // Get the id of the next student
    var nextStudent = function(id) {
      var students = this;
      var sorted = _.pluck(_.sortBy(students, 'firstname'), '_id');
      var pos = _.indexOf(sorted, id);
      if (pos == sorted.length-1) return sorted[0];
      return sorted[pos+1];
    }

    // Get the id of the previous student
    var prevStudent = function(id) {
      var students = this;
      var sorted = _.pluck(_.sortBy(students, 'firstname'), '_id');
      var pos = _.indexOf(sorted, id);
      if (pos == 0) return sorted[sorted.length-1];
      return sorted[pos-1];
    }

    // Map our showDate() function to a binding of showdates and the program name
    _.map(data.students, function(student) {
      student.showdate = _.bind(showDate, showdates, student.program);
      student.peers = _.bind(sameProgram, data.students, student.program);
      student.slideshow = _.bind(slideShow, data.slideshow, student._id);
      student.slideshowcount = _.bind(slideShowcount, data.slideshow, student._id);
      student.slideshowimages = _.bind(slideShowimages, data.slideshow, student._id);
      student.slideshowsingle = _.bind(slideShowsingle, data.slideshow, student._id);
      student.nextid = _.bind(nextStudent, data.students, student._id);
      student.previd = _.bind(prevStudent, data.students, student._id);
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

    // Event to trigger to link up the peers on the student overlay
    $(window).on('activatePeers', function() {
      $('ul.program-peers li').removeClass('active');
      // Get the active element and previous and next for button usage
      var $active = $('span[id="id-'+sessionStorage.activestudent+'"]');
      $active.parent().addClass('active');
      // When closing the window, revert the body overflow and scroll position
      $('.student-overlay button.close').on('click touch', function(e) {
        hash.remove('id');
        $('html,body').css('overflow','auto').css('height', '');
        if (_.isUndefined(sessionStorage.overlaypos) == false) {
          delete(sessionStorage.overlaypos);
        }
        $('body').animate({ scrollTop: sessionStorage.scrollpos }, 0);
      });
      $('.student-overlay img.logo').on('click touch', function(e) {
        hash.remove('id');
        $('html,body').css('overflow','auto').css('height', '');
        if (_.isUndefined(sessionStorage.overlaypos) == false) {
          delete(sessionStorage.overlaypos);
        }
        $('body').animate({ scrollTop: sessionStorage.scrollpos }, 0);
      });
      // Navigate to a random person in the list
      $('.student-nav li.random').off().on('click touch', function(e) {
        var ids = _.pluck(data.students, '_id');
        var random_id = ids[_.random(0,ids.length-1)];
        hash.add({id:random_id});
      });
      // Create click handlers for each person in the same program
      $('ul.program-peers li').on('click touch', function(e) {
        var id = $(this).find('.id').html();
        sessionStorage.overlaypos = $('.student-overlay').scrollTop();
        hash.add({id:id});
      });
    });

    // Process items on hashchange
    $(window).on('hashchange', function(e) {
      var id = hash.get('id');
      if (_.isUndefined(id) == false) {
        var s = _.where(data.students, { _id:id })[0];
        $('.student-overlay').remove();
        $('body').append(StudentOverlay.render(s));
        $('html,body').css('overflow','hidden').height($(window).height());
        $('div.carousel-inner div.item:nth-of-type(1)').addClass('active');
        $('.student-nav a').on('click touch', function() {
          console.log("pos");
          sessionStorage.overlaypos = $('.student-overlay').scrollTop();
        });
        $('#slideshow ol.carousel-indicators li:nth-of-type(1)').addClass('active');
        if (_.isUndefined(sessionStorage.overlaypos) == false) {
          $('.student-overlay').animate({ scrollTop: sessionStorage.overlaypos }, 0);
        }
        sessionStorage.activestudent = s._id;
        $(window).trigger('activatePeers');
      } else {
        $('.student-overlay').remove();
        $('html,body').css('overflow','auto').css('height', '');
        if (_.isUndefined(sessionStorage.overlaypos) == false) {
          delete(sessionStorage.overlaypos);
        }
        $('body').animate({ scrollTop: sessionStorage.scrollpos }, 0);
      }
    });

    // Things to do when the studentlist is updated
    studentlist.on('updated', function() {
      $('li.student').each(function(i,obj) {
        // Retrieve the id for the current list item
        var id = $(this).find('p.id').html();
        // Click handler for the list item
        $(this).off('click touch').on('click touch', function(e) {
          // Get the student information from the list
          var s = _.where(data.students, { id:id })[0];
          sessionStorage.activestudent = s._id;
          hash.add({id:s._id});
          // Save the current scroll position
          sessionStorage.scrollpos = document.body.scrollTop;
          // When we close the window, rest the body overflow and scroll position
          $(window).trigger('activatePeers');
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
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
    // Process gallery filter
    $('#gallery-filter a').on('click touch', function(e) {
      e.preventDefault();
      var gallery = $(this).data('gallery');
      studentlist.filter(function(item) {
        var terms = gallery.split(',');
        var match = false;
        for (var i = 0; i<terms.length; i++) {
          if (item.values().exhibitionlocation.replace('&amp;','&').toLowerCase().indexOf(terms[i].toLowerCase()) >= 0) match = true;
        }
        return match;      
      });
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
    // Process gallery filter
    $('#galleries-data ul').each(function() {
      $galleries = $(this).find('li');
      $galleries.slice(0,$galleries.length-2).on('click touch', function(e) {
        e.preventDefault();
        var gallery = $(this).parent().data('gallery');
        studentlist.filter(function(item) {
          var terms = gallery.split(',');
          var match = false;
          for (var i = 0; i<terms.length; i++) {
            if (item.values().exhibitionlocation.replace('&amp;','&').toLowerCase().indexOf(terms[i].toLowerCase()) >= 0) match = true;
          }
          return match;      
        });
        var pos = $('#students').offset();
        $('body').animate({ scrollTop: pos.top-150 });
      });
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
      var program = decodeURIComponent($(this).data('program'));
      studentlist.filter(function(item) {
        return item.values().program.replace('&amp;','&').toLowerCase().indexOf(program.toLowerCase()) >= 0;
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
        studentlist.filter(function(item) {
          return item.values().name.length > 1;
        });
        studentlist.sort('name', {order: 'asc'});
      }
      var pos = $('#students').offset();
      $('body').animate({ scrollTop: pos.top-150 });
    });
    if (window.location.hash.length > 0) {
      $(window).trigger('hashchange');
    }
  });

  // Navigation menu
  $('ul.nav > li > a').on('click touch', function(e) {
    e.preventDefault();
    offset = $(this.hash).offset().top - 150;
    if ($(this).attr('href') == '#intro') offset = 0;
    $('html, body').stop().animate({
      scrollTop: offset
    }, 400);
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

