JS2 = {
    ///	<summary>
	/// 	JavaScript Space System
    ///		Name space para as classes que controlam o espaço
	///		Autor: Alexandre Patrocinio
    ///	</summary>	
}

JS2.defaultObject = function () {
    ///	<summary>
	/// 	Classe padrão da qual todos os objects do framework irão herdar
    ///		Assim teremos algums métodos básicos uteis a quaisquer objetos
    ///	</summary>		
    this.getOffsetLeft = function (el) {
        var x;

        x = el.offsetLeft;
        if (el.offsetParent != null)
            x += this.getOffsetLeft(el.offsetParent);

        return x;
    }

    this.getOffsetTop = function (el) {

        var y;

        y = el.offsetTop;
        if (el.offsetParent != null)
            y += this.getOffsetTop(el.offsetParent);

        return y;
    }
}

JS2.Graphics = {
    ///	<summary>
    ///		Sub name space para as classes graficas /!\ Por enquanto só preciso de uma...
    ///	</summary>	
}

JS2.Graphics.point = function (x, y, z) {
    ///	<summary>
	/// 	Classe para abstração do conceito matemático de "ponto" dentro das cordenadas cartesianas
    ///		e converte o valor relativo das cordenadas do ponto para o valor real, left e top, da tela.
    ///	</summary>
	
    //Simulando a "herança" no javascript. Herda da classe padrão JS2.defaultObject
    JS2.defaultObject.call(this);

    this.left0 = screen.width / 2;
    this.top0 = screen.height / 2;
    this.zIndex0 = screen.width / 2;
    this.x = (x == null ? 0 : parseInt(x));
    this.y = (y == null ? 0 : parseInt(y));
    this.z = (z == null ? 0 : parseInt(z));
    this.convertLT = function () {
        var p1 = new JS2.Graphics.point();
        p1.x = parseInt(this.left0) + parseInt(this.x);
        p1.y = parseInt(this.top0) - parseInt(this.y);
        p1.z = parseInt(this.zIndex0) + parseInt(this.z);
        return p1;
    }
}

JS2.Graphics.fadeTo = function (el, from, to, steps, curr) {
    var to = to;
    var stps = steps || 5;
    var from = from || (to / stps);
    var curr = curr || from;
    curr = curr + ((to - from) / stps);

    el.style.opacity = Number(curr / 100);
    el.style.filter = 'alpha(opacity=' + Number(curr) + ')';
    if (Math.round(curr) != to) {
        setTimeout(function () { JS2.Graphics.fadeTo(el, from, to, steps, curr); }, 100);
    }
}

JS2.spaceSystem = function (centralObject, zaxlelength, showOrbits, maxZomm) {
    ///	<summary>
    ///		Classe responsável pelo gerênciamento dos objetos no espaço
    ///	</summary>
    ///	<param name="centralObject" type="HTMLelement">
    ///		elemento html que representa o objeto central do espaço;
    ///	</param>
    ///	<param name="zaxlelength" type="int">
    ///		Comprimento do eixo z das cordenadas cartezianas. O valor padrão é screen.width;
    ///	</param>
    ///	<param name="showOrbits" type="boolean">
    ///		torna visível a orbita do objeto. O valor padrão é false; /!\ Se habilitado a animação fica lenta. Ponto à melhorar
    ///	</param>
    ///	<param name="maxZomm" type="int">
    ///		Variação máxima de zomm. O valor padrão é 10(10 vezes o tamanho do objeto);
    ///	</param>
	
    //Simulando a "herança" no javascript. Herda da classe padrão JS2.defaultObject
    JS2.defaultObject.call(this);

    window['currentSpaceSystem'] = this;

    this.maxzIndex = (zaxlelength ? zaxlelength : screen.width);

    this.centralObjectinSpace = centralObject;

    this.maxZomm = (maxZomm ? maxZomm : 10);
	
    this.point = JS2.Graphics.point;	

    this.initProperties = function (obj) {
        if (obj.InitSSProperties === undefined || obj.InitSSProperties == null) {
            obj['InitSSProperties'] = true;
            obj['OldFontSize'] = (obj.style.fontSize ? parseInt(obj.style.fontSize.replace("px", "")) : 11);
            obj['OldWidth'] = obj.offsetWidth;
            obj['OldHeight'] = obj.offsetHeight;
            obj['zWidth'] = obj.offsetWidth;
            obj['zHeight'] = obj.offsetHeight;
            obj['Central'] = false;
            obj['Center'] = null;
            obj['OrbitalIndex'] = null;
            obj['OrbitalObjects'] = [];
            obj['registerOrbitalObject'] = function (orbt) {
                currentSpaceSystem.initProperties(orbt);
                this.Central = true;
                this.OrbitalIndex = null;
                orbt.Center = this;
                this.OrbitalObjects.push(orbt);
                orbt.OrbitalIndex = this.OrbitalObjects.length - 1;
            }
            var p = new this.point();
            obj['Oldr'] = null;
            obj['r'] = null;
            obj['setRadius'] = function (r) {
                if (!r) {
                    var p = new currentSpaceSystem.point();
                    r = Math.round(p.convertLT().x / 3);
                }
                this.Oldr = r;
                this.r = r;
            }
            obj['a'] = 1; //Indica o angulo atual de translação do objeto.
            obj.setRadius(); //raio de translação
            obj['s'] = 1 //velocidade angular (graus/segundo)
            obj['zx'] = 0; //efeito de rotação do eixo X (graus)
            obj['zy'] = 0; //efeito de rotação do eixo y (graus)
            //efeito de deslocamento do eixo X, Y, Z
            obj['mvx'] = 0;
            obj['mvy'] = 0;
            obj['mvz'] = 0;
            obj['padding'] = 0; //Distância entre os objtos em uma mesma orbita (graus)
            obj['OrbitalSelectedIndex'] = null; // indice do objeto atual que tem o cálculo de sua orbita em curso;
            obj.showOrbit = false; //Cada objeto em orbita pode tornar visível sua orbita; 
            obj.style.position = 'absolute';
            obj.style.left = this.getOffsetLeft(obj) + 'px';
            obj.style.top = this.getOffsetTop(obj) + 'px';
            obj.style.width = obj.offsetWidth + 'px';
            obj.style.height = obj.offsetHeight + 'px';
            obj.style.zIndex = (screen.width / 2);
        }
    }

    this.initProperties(centralObject);
    centralObject.Central = true;

    this.fps = 30;
    this.InvertRotationObject = null;
    this.pause = false;
    this.noZoom = false;
    this.showOrbits = (showOrbits ? showOrbits : false);

    this.setFps = function (fps) {
        //Controla a quantidade de quadros por segundo da animação
        if (!fps) fps = 30;
        this.fps = fps;
    }

    document.onkeypress = function (e) {
        e = (e == null ? window.event : e);
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == 32) currentSpaceSystem.pause = !currentSpaceSystem.pause;
    }

    this.onobjectturn = function (obj) {
        //Os objetos que passarem do limite máximo do espaço sumirão do angulo de visão;
        if (parseInt(obj.style.zIndex) > currentSpaceSystem.maxzIndex) {
            var to = (100 - (parseInt(obj.style.zIndex) - currentSpaceSystem.maxzIndex) < 0 ? 0 : 100 - (parseInt(obj.style.zIndex) - currentSpaceSystem.maxzIndex));
            JS2.Graphics.fadeTo(obj, 100, to, 1);
        }
        else JS2.Graphics.fadeTo(obj, 100, 100, 1);
    }

    this.turn = function (Centralobj, onmove) {
        if (this.pause && !onmove) return;

        var inv = (this.InvertRotationObject ? this.InvertRotationObject.checked : false);

        var p = new this.point();
        var zCenter;

        Centralobj = (Centralobj == null ? this.centralObjectinSpace : Centralobj);

        //Inicializa o ponto zero de interceção entre os eixos X, Y e Z
        p.left0 = Math.round(this.getOffsetLeft(Centralobj) + (Centralobj.offsetWidth / 2));
        p.top0 = Math.round(this.getOffsetTop(Centralobj) + (Centralobj.offsetHeight / 2));
        zCenter = p.zIndex0;
        p.zIndex0 = Centralobj.style.zIndex;

        //Pega cada objeto registrado na orbita do objeto central e executa a translação.
        for (Centralobj.OrbitalSelectedIndex = Centralobj.OrbitalObjects.length - 1; Centralobj.OrbitalSelectedIndex >= 0; Centralobj.OrbitalSelectedIndex--) {
            var obj = Centralobj.OrbitalObjects[Centralobj.OrbitalSelectedIndex];

            //Controla o tamanho do ráio de orbita do objeto para o efeito de aproximação e distanciamento
            var percentSize = Math.pow(Math.pow(this.maxZomm, 1 / (screen.width / 2)), (parseInt(Centralobj.style.zIndex) - zCenter));
            obj.r = (obj.Oldr * percentSize);
            
            //Executa a translação em torno do objeto central
			p.x = Math.round(Math.cos(Math.PI / 180 * (obj.a + (Centralobj.OrbitalSelectedIndex * Centralobj.padding))) * (Math.cos(Math.PI / 180 * obj.zx) * obj.r)) + obj.mvx;

			p.y = Math.round((inv ? -1 : 1) * Math.sin(Math.PI / 180 * (obj.a + (Centralobj.OrbitalSelectedIndex * Centralobj.padding))) * (Math.cos(Math.PI / 180 * obj.zy) * obj.r)) + obj.mvy;
				
            if (obj.zx > 0 && obj.zy > 0) {
                p.z = (Math.round(Math.cos(Math.PI / 180 * (obj.a + (Centralobj.OrbitalSelectedIndex * Centralobj.padding))) * (((90 - obj.zx) / 90) * obj.r)) + obj.mvz) +
                      (Math.round(Math.sin(Math.PI / 180 * (obj.a + (Centralobj.OrbitalSelectedIndex * Centralobj.padding))) * (((90 - obj.zy) / 90) * obj.r)) + obj.mvz);
            }
            else {
                p.z = (Math.round(Math.cos(Math.PI / 180 * (obj.a + (Centralobj.OrbitalSelectedIndex * Centralobj.padding))) * ((obj.zx / 90) * obj.r)) + obj.mvz) +
                      (Math.round(Math.sin(Math.PI / 180 * (obj.a + (Centralobj.OrbitalSelectedIndex * Centralobj.padding))) * ((obj.zy / 90) * obj.r)) + obj.mvz);
            }

            //Mostra a orbita do objeto;
            var oPoint, cxt;
            if ((this.showOrbits || obj.showOrbit) && obj.a <= 360) {
                var oPoint = document.createElement("canvas");
                if (oPoint.getContext) {
                    var cxt = oPoint.getContext("2d");
                    cxt.fillStyle = "#66FF33";
                    cxt.beginPath();
                    cxt.arc(1, 1, 1, 0, Math.PI * 2, true);
                    cxt.closePath();
                    cxt.fill();
                    oPoint.style.position = "absolute";
                    oPoint.style.left = p.convertLT().x + 'px';
                    oPoint.style.top = p.convertLT().y + 'px';
                }
                else {
                    oPoint = document.createElement("div");
                    oPoint.style.position = "absolute";
                    oPoint.style.width = "1px";
                    oPoint.style.height = "1px";
                    oPoint.style.background = "#66FF33";
                    oPoint.style.left = p.convertLT().x + 'px';
                    oPoint.style.top = p.convertLT().y + 'px';
                    oPoint.style.zIndex = p.convertLT().z;
                }
                obj.parentNode.appendChild(oPoint);
				setTimeout(function() {obj.parentNode.removeChild(oPoint);}, 10000);				
            }

            //Posiciona o objeto em sua nova orbita
            obj.style.left = (p.convertLT().x - (obj.offsetWidth / 2)) + 'px';
            obj.style.top = (p.convertLT().y - (obj.offsetHeight / 2)) + 'px';
            obj.style.zIndex = p.convertLT().z;

            //*****Bloco de controle do efeito de profundidade dos objetos em relação ao eixo Z*****
            //Reinicia o ângulo para manter a contagem angular em 360º
            //if (this.a >= 360) this.a = 0;

            percentSize = Math.pow(Math.pow(this.maxZomm, 1 / (screen.width / 2)), (parseInt(p.convertLT().z) - zCenter));

            //Controla as dimenções do objeto para o efeito de aproximação e distanciamento            
            obj.zWidth = (parseFloat(obj.OldWidth) * percentSize);
            obj.zHeight = (parseFloat(obj.OldHeight) * percentSize);
            obj.style.width = parseInt(obj.zWidth) + 'px';
            obj.style.height = parseInt(obj.zHeight) + 'px';

            obj.style.fontSize = parseInt(parseInt(obj.OldFontSize) * percentSize) + 'px';
            if (obj.hasChildNodes()) {
                for (j = 0; j < obj.childNodes.length; j++)
                    if (obj.childNodes[j].style)
                        obj.childNodes[j].style.fontSize = parseInt(parseInt(obj.OldFontSize) * percentSize) + 'px';
            }
            //**************************************************************************************

            this.onobjectturn(obj);

            /*Caso o objeto em orbita possua outros objetos em sua orbita
            o processo se repete recursivamente*/
            if (obj.Central) this.turn(obj, onmove);

            //próximo angulo
            if (!onmove) obj.a += (obj.s * (1 / this.fps));
        }
    }

    this.Interval;

    //Inicia processo de translação
    this.turnon = function () {
        if (this.Interval) clearInterval(this.Interval);
        this.Interval = setInterval("currentSpaceSystem.turn()", Math.round(1000 / this.fps));
    }

    this.Zoom = function (centralObject, inout, zoom) {
        if (!this.noZoom) {
            centralObject = (centralObject == null ? currentSpaceSystem.centralObjectinSpace : centralObject);
            if ((parseInt(centralObject.style.zIndex) + (10 * inout)) >= 0 && (parseInt(centralObject.style.zIndex) + (10 * inout)) <= currentSpaceSystem.maxzIndex) {
                try {
                    centralObject.style.zIndex = parseInt(centralObject.style.zIndex) + (10 * inout);

                    var p = new this.point();

                    zoom = (zoom == 0 ? (parseInt(centralObject.style.zIndex) - p.convertLT().z) : zoom);

                    centralObject.r = centralObject.Oldr * Math.pow(Math.pow(this.maxZomm, 1 / (screen.width / 2)), zoom);
                    centralObject.zWidth = (parseFloat(centralObject.OldWidth) * Math.pow(Math.pow(this.maxZomm, 1 / (screen.width / 2)), zoom));
                    centralObject.zHeight = (parseFloat(centralObject.OldHeight) * Math.pow(Math.pow(this.maxZomm, 1 / (screen.width / 2)), zoom));
                    centralObject.style.width = parseInt(centralObject.zWidth) + 'px';
                    centralObject.style.height = parseInt(centralObject.zHeight) + 'px';

                    var perc = Math.pow(Math.pow(this.maxZomm, 1 / (screen.width / 2)), zoom) / this.maxZomm;

                    currentSpaceSystem.turn(centralObject, true);
                }
                catch (e) {
                    alert(e.description);
                }
            }
        }
    }

    this.wheel = function (e) {
        var delta = 0;

        if (!e) var e = window.event;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
            if (window.opera)
                delta = -delta;
        }
        else if (e.detail) {
            delta = -e.detail / 3;
        }

        if (delta)
            currentSpaceSystem.Zoom(currentSpaceSystem.centralObjectinSpace, delta, 0);

        if (e.preventDefault) e.preventDefault();

        e.returnValue = false;
    }

    if (window.addEventListener) window.addEventListener('DOMMouseScroll', this.wheel, false);
    window.onmousewheel = document.onmousewheel = this.wheel;
}	