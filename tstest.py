#! /usr/bin/env python
import os
import sys
import commands

tsname = sys.argv[1]
commands.getoutput('tsc ' + tsname)

jsname = tsname.split('.')[0] + '.js'
source = """<html>
  <head>
    <title>test</title>
    <body>
      <script src="%s"></script>      
    </body>
  </head>
</html>""" % jsname
htmlname = tsname.split('.')[0] + '.html'
open(htmlname, 'w').write(source)

os.system('open -a "Google Chrome" '+ htmlname)
