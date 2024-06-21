# Chatbot

The chatbot GUI uses node to implement a simple chat interface.

### Launching the chatbot node

You can launch the chatbot GUI node with docker. To build the image, run the following command:

```{powershell}
docker build . -t chatbot:<tag> --no-cache
```

Then, to launch the chatbot GUI server, run the following command. 

> Note: the chatbot GUI server requires port 3000
```{powershell}
docker run -p 3000:3000 chatboot:0.1.0
```

## Message categories

| category    | Destination |
|------------ |--------- |
| moisture    | platform |
| temperature | platform |
| greetings   | internal |
| default     | internal | 