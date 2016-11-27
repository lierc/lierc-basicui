var Emoji = function() {
  var emoji = this;
  var list = $('#emoji ul');

  for (var i=0; i < Emoji.data.length; i++) {
    var li = $('<li/>', {
      'data-chars': Emoji.data[i]['chars'],
      'data-keywords': Emoji.data[i]['keywords'],
      'data-name': Emoji.data[i]['name'],
      title: Emoji.data[i]['name']
    }).text(Emoji.data[i]['chars']);
    list.append(li);
  }

  emoji.filter = function(list, text) {
    var items = list.find('li');

    if (!text) {
      items.show();
      return;
    }

    var len = items.length;
    var t = text.toLowerCase();
    var show = [];
    var hide = [];

    for (var i=0; i < len; i++) {
      if (items[i].getAttribute('data-keywords').indexOf(t) != -1)
        show.push(items[i]);
      else if (items[i].getAttribute('data-name').indexOf(t) != -1)
        show.push(items[i]);
      else
        hide.push(items[i]);
    }

    $(show).show();
    $(hide).hide();
  };
};

Emoji.names = {}
Emoji.data = [];
Emoji.regex = new RegExp();

(function() {
  $.ajax({
    url: "/static/emoji-data.json",
    type: "GET",
    dataType: "json",
    success: function(res) {
      var codepoints = [];
      for (var i=0; i < res.length; i++) {
        var annotations = res[i]['annotations'] || [];
        Emoji.data.push({
          chars: res[i]['chars'],
          keywords: annotations.join(" ").toLowerCase(),
          name: res[i]['name']
        });

        Emoji.names[ res[i]['chars'] ] = res[i]['name'];

        var surrogate = "";
        for (var j=0; j < res[i]['codes'].length; j++) {
          if (res[i]['codes'][j].length > 4) {
            var C = parseInt("0x"+res[i]['codes'][j]);
            var H = Math.floor((C - 0x10000) / 0x400) + 0xD800;
            var L = (C - 0x10000) % 0x400 + 0xDC00;
            surrogate += "\\u" + H.toString(16) + "\\u" + L.toString(16);
          }
          else {
            surrogate += "\\u" + res[i]['codes'][j];
          }
        }
        codepoints.push(surrogate);
      }
      var sorted = codepoints.sort(function(a, b) {
        if (a.length > b.length)
          return -1;
        else if (a.length == b.length)
          return 0;
        else
          return 1;
      });
      Emoji.regex = new RegExp("(" + sorted.join("|") + ")", "g");
    }
  });
})();
