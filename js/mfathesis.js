$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,$('header img.backgroundfill').length)+')').show();
  
  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    var StudentTemplate = Hogan.compile($('#students-template').html());
    $('#projects-demo').html(StudentTemplate.render(data));

    var options = {
      valueNames: [ 'name', 'program', 'exhibitionlocation' ]
    };

    var studentlist = new List('students', options);
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
      $('body').animate({ scrollTop: pos.top });
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
      $('body').animate({ scrollTop: pos.top });
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

