_cli_methods="init build deploy test run clean status logs help version"
_cli_flags="--f --a --b --tolerancia --salida --tabla"

_cli_complete() {
    local curr
    curr="${COMP_WORDS[COMP_CWORD]}"

    if [[ "$curr" == --* ]]; then
        COMPREPLY=( $(compgen -W "$_cli_flags" -- "$curr") )
        return 0
    fi

    if [[ $COMP_CWORD -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "$_cli_methods" -- "$curr") )
        return 0
    fi
}

complete -F _cli_complete chuspanumeric