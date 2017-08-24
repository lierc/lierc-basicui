var Commands = function(app) {
  var app = app;
  var commands = this;
  var handlers = {};

  function add_command(name, aliases, handler) {
    handlers[name] = handler;
    aliases.forEach(function(alias) {
      handlers[alias] = handler;
    });
  }

  commands.completions = function() {
    return Object.keys(handlers).map(function(k) {
      return "/" + k;
    });
  };

  add_command("help", ["h"], function(panel, line) {
    app.new_dialog("help");
    return;
  });

  add_command("panel", ["p"], function(panel, line) {
    var parts  = line.split(" ", 2);
    var action = parts[0];
    var rest   = parts[1];

    switch (action) {
    case "move":
      var order = parseInt(rest);
      var li = panel.elem.nav;
      var ul = li.parentNode;
      var before = ul.querySelectorAll('li:not([data-panel-id="' + panel.id + '"])')[order - 1];
      if (before) {
        ul.removeChild(li);
        ul.insertBefore(li, before);
        app.save_channel_order();
      }
      else {
        alert("Invalid position: '" + order + "'");
      }
      break;
    default:
      alert("Unknown command: 'panel " + line + "'");
    }
    return;
  });

  add_command("join", ["j"], function(panel, line) {
    var parts = ["JOIN", line];
    return parts.join(" ");
  });

  add_command("nick", [], function(panel, line) {
    var parts = ["NICK", line];
    return parts.join(" ");
  });

  add_command("mode", [], function(panel, line) {
    var parts =["MODE", panel.name];
    if (line) {
      parts.push(line);
    }
    return parts.join(" ");
  });

  add_command("ignores", [], function(panel) {
    // TODO sane way to return this list to the user?
    alert(app.ignores(panel).join("\n"));
    return;
  });

  add_command("ignore", [], function(panel, nick) {
    app.add_ignore(panel, nick);
    return;
  });

  add_command("unignore", [], function(panel, nick) {
    app.remove_ignore(panel, nick);
    return;
  });

  add_command("last", ["lastlog", "l"], function(panel, line) {
    if (panel.type == "status") {
      throw "Can not search on a status panel.";
    }

    if (!line) {
      throw "Search text required";
    }

    app.search_panel(panel, line);
  });

  add_command("clear", [], function(panel) {
    panel.backlog_empty = true;
    panel.remove_observers(panel.elem.list);
    panel.elem.list.get(0).innerHTML = '';
  });

  add_command("bikin", ["bike", "biek", "beik"], function(panel) {
    var url = ":https://www.youtube.com/watch?v=WYi-YUsYZtY";
    return ["PRIVMSG", panel.name, url].join(" ");
  });

  add_command("bustin", ["bust"], function(panel) {
    var url = ":https://www.youtube.com/watch?v=0tdyU_gW6WE";
    return ["PRIVMSG", panel.name, url].join(" ");
  });

  add_command("trim", ["prune"], function(panel) {
    panel.prune();
  });

  add_command("part", ["close","wc"], function(panel, line) {
    if (panel.type == "status") {
      throw "Can not close status panel.";
    }

    if (panel.type == "private") {
      app.close_panel(panel.id);
      return;
    }

    var parts = ["PART", panel.name];

    if (line)
      parts.push(":" + line);

    return parts.join(" ");
  });

  add_command("who", [], function(panel, line) {
    var parts = ["WHO", ":" + line];
    return parts.join(" ");
  });

  add_command("whois", [], function(panel, line) {
    var parts = ["WHOIS", ":" + line];
    return parts.join(" ");
  });

  add_command("names", ["n", "nicks"], function(panel, line) {
    var parts = ["NAMES"];
    if (!line) {
      parts.push(":" + panel.name);
    }
    else {
      parts.push(":" + line);
    }
    document.querySelector('#toggle-nicks').click();
    return parts.join(" ");
  });

  add_command("say", [""], function(panel, line) {
    return ["PRIVMSG", panel.name, ":" + line].join(" ");
  });

  add_command("query", ["q","msg"], function(panel, line) {
    var args = line.split(" ", 1);
    var rest = line.substring(args[0].length).trim();

    if (!rest.length) {
      var connection = panel.connection;
      app.add_panel(args[0], connection, true);
      return;
    }

    var parts = ["PRIVMSG", args[0]];
    parts.push(":" + rest);

    return parts.join(" ");
  });

  add_command("me", [], function(panel, line) {
    var parts = ["PRIVMSG", panel.name];
    parts.push(":" + "\x01" + "ACTION " + line);
    return parts.join(" ");
  });

  add_command("topic", ["t"], function(panel, line) {
    if (panel.type != "channel") {
      throw "TOPIC only works for channels";
    }

    var parts = ["TOPIC", panel.name];

    if (line)
      parts.push(":" + line);

    return parts.join(" ");
  });

  add_command("quote",["raw"], function(panel, line) {
    return line;
  });

  add_command("collapse", [], function(panel, line) {
      panel.set_collapse_embeds(true);
      return;
  });

  add_command("expand", [], function(panel, line) {
      panel.set_collapse_embeds(false);
      return;
  });

  commands.handle = function(panel, line) {
    var parts = line.split(" ", 1);
    var command = parts[0].toLowerCase();

    if ( command in handlers ) {
      var rest = line.substring(command.length);
      return handlers[command](panel, rest.trim());
    }

    throw "Unknown command " + parts[0];
  };
};
