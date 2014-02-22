$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type(' + _.random(1, $('header img.backgroundfill').length) + ')').show();

  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    var thing = [];
    var showdates = [{
      name: ["Hoffberger"],
      date: '4/25/2013'
    }, {
      name: ["Post Bac FA"],
      date: '1/31/2014'
    }, {
      name: ["Graphic Design", "Post Bac GD", "Illustration Practice"],
      date: '3/28/2014'
    }, {
      name: "Social Design",
      date: '4/23/2014'
    }, {
      name: ["Photo & Electronic Media", "Community Arts", "Photo & Electronic Media"],
      date: '4/11/2014'
    }, {
      name: ["MA Teaching"],
      date: '1/24/2014'
    }, {
      name: ["Mount Royal"],
      date: '4/25/2014'
    }, {
      name: ['Rinehart', 'Curatorial'],
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
    $('#projects-demo').html(StudentTemplate.render(data));

    //set all student thumb areas to same height (new design on the fly!)
    var thumbheight = -1;
    $('.grid-display .thumb').each(function() {
      thumbheight = thumbheight > $(this).height() ? thumbheight : $(this).height();
    });
    $('.grid-display .thumb').each(function() {
      $(this).height(thumbheight);
    });

    var options = {
      valueNames: ['name', 'program', 'exhibitionlocation']
    };

    var studentlist = new List('students', options);
    studentlist.sort('name', {
      order: 'asc'
    });
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
      $('body').animate({
        scrollTop: pos.top
      });
    });
    $('a.sort-studentlist').on('click touch', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      if (type === 'program') {
        studentlist.filter();
        studentlist.sort('program', {
          sortFunction: function(a, b) {
            if (a.values().program < b.values().program) return -1;
            if (a.values().program > b.values().program) return 1;
            if (a.values().name < b.values().name) return -1;
            if (a.values().name > b.values().name) return 1;
            return 0;
          }
        });
      } else if (type === 'all') {
        studentlist.filter();
        studentlist.filter(function(item) {
          return item.values().name.length > 1;
        });
        studentlist.sort('name', {
          order: 'asc'
        });
      }
      var pos = $('#students').offset();
      $('body').animate({
        scrollTop: pos.top
      });
    });
  });
});
