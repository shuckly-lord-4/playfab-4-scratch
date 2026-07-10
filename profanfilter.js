(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This extension must run unsandboxed");
  }

  class ProfanityExtension {
    getInfo() {
      return {
        id: "profanityCheck",
        name: "Profanity Check",
        color1: "#ff6680",
        blocks: [
          {
            opcode: "checkMessage",
            blockType: Scratch.BlockType.REPORTER,
            text: "check profanity in [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "hello world"
              }
            }
          }
        ]
      };
    }

    async checkMessage(args) {
      const message = String(args.MESSAGE ?? "");

      try {
        const res = await Scratch.fetch("https://vector.profanity.dev", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message })
        });

        const data = await res.json();

        // return readable JSON string for Scratch
        return JSON.stringify(data);
      } catch (err) {
        console.error(err);
        return "request failed";
      }
    }
  }

  Scratch.extensions.register(new ProfanityExtension());
})(Scratch);
