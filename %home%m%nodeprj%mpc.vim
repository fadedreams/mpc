let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/nodeprj/mpc
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
<<<<<<< Updated upstream
badd +22 services/alert/src/app.ts
badd +67 ~/nodeprj/mpc/services/alert/src/alert/alertServer.ts
badd +126 docker-compose.yml
badd +13 services/alert/Dockerfile
badd +22 services/alert/Dockerfile.prod
badd +21 services/alert/package.json
badd +22 services/alert/build/src/app.js
badd +1 ~/nodeprj/mpc/services/alert/build/src/config/index.d.ts
badd +39 services/alert/tsconfig.json
argglobal
%argdel
$argadd .
edit services/alert/package.json
argglobal
balt services/alert/build/src/app.js
=======
badd +135 ~/nodeprj/mpc/services/gateway/src/gateway/gatewayServer.ts
badd +5 services/gateway/.env
badd +17 services/gateway/src/gateway/elasticSearchService.ts
badd +8 services/gateway/package.json
badd +192 docker-compose.yml
badd +1 services/gateway/Dockerfile
badd +1 services/gateway/src/broker/gatewayQueueConnection.ts
badd +3 ~/nodeprj2/nodeprj/mov_ticket/docker-compose.yml
argglobal
%argdel
$argadd .
edit services/gateway/.env
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt services/gateway/src/gateway/elasticSearchService.ts
>>>>>>> Stashed changes
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
<<<<<<< Updated upstream
2
normal! zo
let s:l = 3 - ((2 * winheight(0) + 11) / 22)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 3
normal! 0
=======
let s:l = 5 - ((4 * winheight(0) + 15) / 31)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 5
normal! 042|
>>>>>>> Stashed changes
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
