$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,3)+')').show();
  
  $.getJSON('http://mfa.cape.io/items/client_data.json', function(data) {
    console.log(data);
    var StudentTemplate = Hogan.compile($('#students-template').html());
    console.log(StudentTemplate.render(data));
    $('#projects-demo').html(StudentTemplate.render(data));
  });
});