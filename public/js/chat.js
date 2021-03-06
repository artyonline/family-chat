  var socket = io();

  socket.on('connect',function (){
    console.log('server running!');
  });

  socket.on('Notice',function(welcome){
    console.log('Notice',welcome);
  });
  socket.on('disconnect',function (){
    console.log('Server connection lost');
  });

  function scrollToBottom (){

    //Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');

    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight)
    {
        messages.scrollTop(scrollHeight)
    }
  }

  socket.on('newLocationMessage',function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template,{
      from : message.from,
      createdAt : formattedTime,
      url : message.url
    });
    // var li = jQuery('<li></li>');
    // var a = jQuery('<a target="_blank">My Current Location</a>')
    // li.text(`${formattedTime} ${message.from} : `);
    // a.attr('href',message.url);
    // li.append(a);
    jQuery('#messages').append(html);
  });

  socket.on('newMessage',function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template,{
      text : message.text,
      from : message.from,
      createdAt : formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();

  });

  jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    var messageTextBox = jQuery('[name=message]');
    var user = window.location.href;

    socket.emit('createMessage',{
      from: localStorage.getItem('User'),
      text:messageTextBox.val()
    },function(){
      messageTextBox.val('');
    });
  });

  var locationButton = jQuery('#send-location');
  locationButton.on('click',function(){
    if(!navigator.geolocation){
      return alert('Geo location is not supported by your browser!');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function(position) {
      locationButton.removeAttr('disabled').text('Send Location');
      socket.emit('createLocationMessage',{
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
      });
    }, function (){
      locationButton.removeAttr('disabled').text('Send Location');
      alert('Unable to fetch Location!');
    });
  })
