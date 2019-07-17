# -*- coding: utf-8 -*- #
# frozen_string_literal: true

module Rouge
  module Lexers
    class Make < RegexLexer
      title "Make"
      desc "Makefile syntax"
      tag 'make'
      aliases 'makefile', 'mf', 'gnumake', 'bsdmake'
      filenames '*.make', 'Makefile', 'makefile', 'Makefile.*', 'GNUmakefile'
      mimetypes 'text/x-makefile'

      # TODO: Add support for special keywords
      # bsd_special = %w(
      #   include undef error warning if else elif endif for endfor
      # )

      def initialize(opts={})
        super
        @shell = Shell.new(opts)
      end

      start { @shell.reset! }

      state :root do
        rule %r/\s+/, Text

        rule %r/#.*?\n/, Comment

        rule %r/(export)(\s+)(?=[a-zA-Z0-9_\${}\t -]+\n)/ do
          groups Keyword, Text
          push :export
        end

        rule %r/export\s+/, Keyword

        # assignment
        rule %r/([a-zA-Z0-9_${}.-]+)(\s*)([!?:+]?=)/m do |m|
          token Name::Variable, m[1]
          token Text, m[2]
          token Operator, m[3]
          push :shell_line
        end

        rule %r/"(\\\\|\\.|[^"\\])*"/, Str::Double
        rule %r/'(\\\\|\\.|[^'\\])*'/, Str::Single
        rule %r/([^\n:]+)(:+)([ \t]*)/ do
          groups Name::Label, Operator, Text
          push :block_header
        end
      end

      state :export do
        rule %r/[\w\${}-]/, Name::Variable
        rule %r/\n/, Text, :pop!
        rule %r/\s+/, Text
      end

      state :block_header do
        rule %r/[^,\\\n#]+/, Name::Function
        rule %r/,/, Punctuation
        rule %r/#.*?/, Comment
        rule %r/\\\n/, Text
        rule %r/\\./, Text
        rule %r/\n/ do
          token Text
          goto :block_body
        end
      end

      state :block_body do
        rule %r/(\t[\t ]*)([@-]?)/ do
          groups Text, Punctuation
          push :shell_line
        end

        rule(//) { @shell.reset!; pop! }
      end

      state :shell do
        # macro interpolation
        rule %r/\$\(\s*[a-z_]\w*\s*\)/i, Name::Variable
        # $(shell ...)
        rule %r/(\$\()(\s*)(shell)(\s+)/m do
          groups Name::Function, Text, Name::Builtin, Text
          push :shell_expr
        end

        rule(/\\./m) { delegate @shell }
        stop = /\$\(|\(|\)|\\|$/
        rule(/.+?(?=#{stop})/m) { delegate @shell }
        rule(stop) { delegate @shell }
      end

      state :shell_expr do
        rule(/\(/) { delegate @shell; push }
        rule %r/\)/, Name::Variable, :pop!
        mixin :shell
      end

      state :shell_line do
        rule %r/\n/, Text, :pop!
        mixin :shell
      end
    end
  end
end
