$(document).ready(function() {
  // Show a random header image
  $('header img.backgroundfill:nth-of-type('+_.random(1,3)+')').show();
});