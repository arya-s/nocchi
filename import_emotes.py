import sys
import json


def import_emotes(argv):
  """
  Imports an cytube emote export json, parses it and stores it inside emotes.json
  :param argv: Name of the to be imported json
  """

  in_file = argv[0]
  parsed = {}

  with open(in_file) as raw:
    emotes = json.load(raw)

    for e in emotes:
      parsed[e["name"]] = e["image"]

    with open('emotes.json', 'w') as out_file:
      json.dump(parsed, out_file)

if __name__ == "__main__":
  import_emotes(sys.argv[1:])
