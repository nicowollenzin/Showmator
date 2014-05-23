/*global io */

// TODO title-edits and deletes
// TODO on delete: check if we have more than one link left, if false: show alert-info again

// vars and functions
// -----------------------------------------------------------------------------

var socket = io.connect('http://localhost:63685'),

    padZero = function(num) {
      return num < 10 ? "0" + num : num;
    },

    formatTime = function(milliseconds) {
      var seconds = Math.floor(milliseconds / 1000),
          hours   = Math.floor(seconds / 3600),
          minutes = Math.floor((seconds / 60) % 60);
      return padZero(hours % 24) + ':' + padZero(minutes) + ':' + padZero(seconds % 60);
    },

    tzOffset = new Date().getTimezoneOffset() * 60000,  // Different between UTC and local time

    $autoOpen = $('#auto-open');


// socket bindings
// -----------------------------------------------------------------------------

socket.on('connect', function () {
  socket.emit('live', $('body').data('publicslug'));
});

socket.on('push', function(data) {
  if ($autoOpen.is(':checked') && !data.isText)
    window.open(data.url, '_blank');
  
  var markup = '<span class="time">' + formatTime(data.time - tzOffset) + '</span>';
  if (data.isText)
    markup += data.title;
  else
    markup += '<a href="' + data.url + '" target="_blank">' + data.title + '</a>';

  $('#result').prepend('<li>' + markup + '</li>');
  $('.alert-info').hide();
});

socket.on('counter', function(data) {
  $('#counter').html(data);
});

// TODO what for?
socket.on('reload', function() {
  location.reload();
});

socket.on('titleUpdatedSuccess', function(data) {
  $('#title').text(data.title);
});


// init
// -----------------------------------------------------------------------------

// format time from timestamp
$('.time').each(function() {
  var $this = $(this);
  $this.text(formatTime(parseInt($this.closest('li').data('time')) - tzOffset));
});

if (!!localStorage) {
  $autoOpen
    .prop('checked', localStorage.autoOpen == 'true')
    .on('change', function() {
      localStorage.autoOpen = $(this).prop('checked');
    });
}

