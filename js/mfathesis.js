$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,$('header img.backgroundfill').length)+')').show();
  
  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    var StudentTemplate = Hogan.compile($('#students-template').html());
    $('#projects-demo').html(StudentTemplate.render(data));
    var options = {
      valueNames: [ 'name', 'program' ]
    };

    var studentlist = new List('students', options);
    studentlist.sort('name', { order: 'asc' });
    studentlist.filter(function(item) {
      return item.values().name.length > 1;
    });
    $('a.sort-studentlist').on('click touch', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      if (type === 'program') {
        studentlist.sort('program', { sortFunction:  function(a,b) {
                                                  if(a.values().program< b.values().program) return -1;
                                                  if(a.values().program>b.values().program) return 1;
                                                  if(a.values().name<b.values().name) return -1;
                                                  if(a.values().name>b.values().name) return 1;
                                                  return 0;
                                                }
        });
      }
    });
  });
  
  //set all student thumb areas to same height (new design on the fly!)
  var thumbheight = -1;
  $('.grid-display .thumb').each(function() {
    thumbheight = thumbheight > $(this).height() ? thumbheight : $(this).height();
  });
  $('.grid-display .thumb').each(function() {
    $(this).height(thumbheight);
  });
  
});