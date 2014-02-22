$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,3)+')').show();
  
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
  });
});