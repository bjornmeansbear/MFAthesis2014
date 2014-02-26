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
      name: ["Rinehart", "Photo & Electronic Media", "Community Arts"],
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
      if (_.isUndefined(slideshow[id] == false)) {
        for (var i=0; i<slideshow[id].length; i++) {
          r.push(i);
        }
      }
      return r;
    }

    // Map our showDate() function to a binding of showdates and the program name
    _.map(data.students, function(student) {
      student.showdate = _.bind(showDate, showdates, student.program);
      student.peers = _.bind(sameProgram, data.students, student.program);
      student.slideshow = _.bind(slideShow, data.slideshow, student._id);
      student.slideshowcount = _.bind(slideShowcount, data.slideshow, student._id);
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
      var previous_id = $active.parent().prev().find('.id:hidden').html();
      var next_id = $active.parent().next().find('.id:hidden').html();
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
      // Navigate to the previous person on the list
      $('.student-nav span.glyphicon-chevron-left').off().on('click touch', function(e) {
        if (_.isUndefined(previous_id) == false) {
          if (_.isUndefined(sessionStorage.overlaypos) == false) {
            delete(sessionStorage.overlaypos);
          }
          hash.add({id:previous_id});
        }
      });
      // Navigate to the next person on the list
      $('.student-nav span.glyphicon-chevron-right').off().on('click touch', function(e) {
        if (_.isUndefined(next_id) == false) {
          if (_.isUndefined(sessionStorage.overlaypos) == false) {
            delete(sessionStorage.overlaypos);
          }
          hash.add({id:next_id});
        }
      });
      // Navigate to a random person in the list
      $('.student-nav span.glyphicon-random').off().on('click touch', function(e) {
        var random_id = $('.program-peers li:nth-of-type('+_.random(1,$('.program-peers li').length)+')').find('.id:hidden').html();
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
      var program = decodeURIComponent($(this).data('program'));
      studentlist.filter(function(item) {
        console.log(program, decodeURIComponent(item.values().program)); 
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

  $('ul.nav > li > a').on('click touch', function(e) {
    e.preventDefault();
    offset = $(this.hash).offset().top - 150;
    if ($(this).attr('href') == '#intro') offset = 0;
    $('html, body').stop().animate({
      scrollTop: offset
    }, 400);
  });
});
