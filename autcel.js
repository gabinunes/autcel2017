// CONSTANTES
MORTA = 0
VIVA = 1
RANDOM = 2;

// CONFIGURAÇÃO
TAMANHO_DA_CELULA = 10;
COR_DA_LINHA = "black";
COR_DA_CELULA = "black";
ESPERA_ENTRE_GERACOES = 100;
CONSIDERAR_EXTREMIDADES = true;


//ObjetoRegras


var regrasPadrao = {
	  viva:{0:"Morta", 1:"Morta", 4:"Morta", 5:"Morta", 6:"Morta", 7:"Morta", 8:"Morta"},
	  morta:{3:"Viva"}
};

var regras = {
		viva: {0:"Morta", 1:"Morta", 4:"Morta", 5:"Morta", 6:"Morta", 7:"Morta", 8:"Morta"},
		morta: {3:"Viva"},
		limparRegras: function(){ 
			this.morta = {}
			this.viva = {}
		},		

		remove : function(estadoIncial, vizinhos) {
     		delete  this[estadoIncial.toLowerCase()][vizinhos];
		}
		
};


function Celula(x, y, estado) {
    var posicaoX = x;
    var posicaoY = y; 
    var estado = estado; 

    this.isViva = function() {
        return estado === VIVA;
    }

    this.mudarEstado = function() {
        estado = estado === MORTA ? VIVA : MORTA;
    }

    this.getPosicaoX = function() {
        return posicaoX;
    }

    this.getPosicaoXNoCanvas = function() {
        return posicaoX * TAMANHO_DA_CELULA;
    }

    this.getPosicaoY = function() {
        return posicaoY;
    }

    this.getPosicaoYNoCanvas = function() {
        return posicaoY * TAMANHO_DA_CELULA;
    }
}

function Canvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    canvas.onclick = function(evt) {
        onClick(evt)
    };
    canvas.width = 400;
    canvas.height = 200;
    var contexto = canvas.getContext("2d");
    var geracoes = {};
    var geracao = 0;
    var celulas = [];
    var intervalId = 0;
    var largura = 0;
    var altura = 0

    this.inicializar = function(modo) {
        document.getElementById("geracao").innerHTML = geracao;
        contexto.strokeStyle = COR_DA_LINHA;
        contexto.fillStyle = COR_DA_CELULA;
        altura = canvas.height / TAMANHO_DA_CELULA;
        largura = canvas.width / TAMANHO_DA_CELULA;
        for (var posicaoX = 0; posicaoX < largura; posicaoX++) {
            celulas[posicaoX] = [];
            for (var posicaoY = 0; posicaoY < altura; posicaoY++) {
                estado = modo === RANDOM ? Math.round(Math.random()) : modo;
                var celula = new Celula(posicaoX, posicaoY, estado);
                celulas[posicaoX][posicaoY] = celula
                desenharCelula(celula);
            }
        }
    };

    var desenhar = function() {
        for (var posicaoX = 0; posicaoX < largura; posicaoX++) {
            for (var posicaoY = 0; posicaoY < altura; posicaoY++) {
                desenharCelula(celulas[posicaoX][posicaoY]);
            }
        }
    }

    var desenharCelula = function(celula) {
        if (celula.isViva()) {
            contexto.fillRect(celula.getPosicaoXNoCanvas(), celula.getPosicaoYNoCanvas(), TAMANHO_DA_CELULA, TAMANHO_DA_CELULA);
        } else {
            contexto.clearRect(celula.getPosicaoXNoCanvas(), celula.getPosicaoYNoCanvas(), TAMANHO_DA_CELULA, TAMANHO_DA_CELULA);
            contexto.strokeRect(celula.getPosicaoXNoCanvas(), celula.getPosicaoYNoCanvas(), TAMANHO_DA_CELULA, TAMANHO_DA_CELULA);
        }
    }

    var onClick = function(evt) {
        celula = celulas[Math.floor(evt.layerX / TAMANHO_DA_CELULA)][Math.floor(evt.layerY / TAMANHO_DA_CELULA)];
        celula.mudarEstado();
        desenharCelula(celula);
    }

    this.calcProximaGeracao = function() {

        var novaGeracao = [];
        for (var posicaoX = 0; posicaoX < largura; posicaoX++) {
            novaGeracao[posicaoX] = [];
            for (var posicaoY = 0; posicaoY < altura; posicaoY++) {
                celula = processarRegras(celulas[posicaoX][posicaoY]);
                novaGeracao[posicaoX][posicaoY] = celula;
                desenharCelula(celula);
            }
        }
        //TODO salvar geraÃ§Ã£o atual
        document.getElementById("geracao").innerHTML = ++geracao;
        celulas = novaGeracao

    }

	this.mostrarProxGeracao = function(){
		this.pararSimulacao();
		this.calcProximaGeracao();
	}


  /*  var processarRegras = function(celula) {
        //TODO Inserir Regras 
        vizinhas = getQuantidadeDeVizinhas(celula);
        if (celula.isViva() && (vizinhas < 2 || vizinhas > 3)) {
            return new Celula(celula.getPosicaoX(), celula.getPosicaoY(), MORTA);
        }
        if (!celula.isViva() && vizinhas === 3) {
            return new Celula(celula.getPosicaoX(), celula.getPosicaoY(), VIVA);
        }
        return celula;
    }*/

	var processarRegras = function(celula) {

        vizinhas = getQuantidadeDeVizinhas(celula);  //procurar se tem regra com esse nr, se n tiver return celula

        if (celula.isViva() && regras.viva[vizinhas]!=undefined) {
            return new Celula(celula.getPosicaoX(), celula.getPosicaoY(), eval(regras.viva[vizinhas].toUpperCase()));
        }

        if (!celula.isViva && regras.morta[vizinhas]!=undefined) {
            return new Celula(celula.getPosicaoX(), celula.getPosicaoY(), eval(regras.morta[vizinhas].toUpperCase()));
        }
        return celula;
    }

    var getQuantidadeDeVizinhas = function(celula) {
        quantidade = 0;
        posicaoX = celula.getPosicaoX();
        posicaoY = celula.getPosicaoY();
        for (var x = posicaoX - 1; x <= posicaoX + 1; x++) {
            for (var y = posicaoY - 1; y <= posicaoY + 1; y++) {
                if (x === posicaoX && y === posicaoY)
                    continue;
                try {
                    var posX = CONSIDERAR_EXTREMIDADES ? (x + largura) % largura : x;
                    var posY = CONSIDERAR_EXTREMIDADES ? (y + altura) % altura : y;
                    if (celulas[posX][posY].isViva()) {
                        quantidade++;
                    }
                } catch (error) {}
            }
        }
        return quantidade;
    }

    this.simular = function() {
        self = this;
        clearInterval(intervalId);
        intervalId = setInterval(function() {
            self.calcProximaGeracao();
        }, ESPERA_ENTRE_GERACOES);

    }

    this.pararSimulacao = function() {
        clearInterval(intervalId);
    }

    this.aleatorio = function() {
        geracao = 0;
        clearInterval(intervalId);
        this.inicializar(RANDOM);
    }

    this.reiniciar = function() {
        geracao = 0;
        clearInterval(intervalId);
        this.inicializar(MORTA);
    }
	

	this.setTamanhoDaCelula = function(tamanho){
		TAMANHO_DA_CELULA = tamanho;
		this.inicializar(MORTA);
	}

	this.setVelocidade = function(espera){
		ESPERA_ENTRE_GERACOES = espera;
		this.inicializar(MORTA);
	}

	this.setTamanhoMatriz = function(altura,largura){
		canvas.height = altura;
		canvas.width = largura;
		this.inicializar(MORTA);
	}


	this.considerarExtremidades = function(estado){
		CONSIDERAR_EXTREMIDADES = estado;
		this.inicializar(MORTA);
		
	}

}


function Tabela(){

	//var quantidadeDeRegras = 0;
	var objMarcado = null;
	

	$("tbody").on('click', 'tr', function () {
		objMarcado = $(this);
		$(this).siblings().removeClass('marcada');	
		$(this).toggleClass('marcada');
		if(!$(this).hasClass('marcada')) {
			objMarcado = null;
		}
	});



	this.criarRegraManual = function(){
		$estadoInicial = $('input[name="estadoinicial"]:checked').val();
		$quantidadeVizinhos = $('#vizinhos option:selected').val();
		$estadoFinal = $('input[name="estadofinal"]:checked').val();

		$tr = $("#"+$estadoInicial+"_"+$quantidadeVizinhos);
		if ($tr.length > 0){

			if($tr.children(":last").html() == $estadoFinal){
				$.notify(
					{ message: 'Regra já inserida anteriormente' },
					{	type: 'danger', z_index: 1111, placement:{from: "top", align: "center"},}
				);
				
				return false;
			}
			$.notify(
					{ message: 'Regra Conflitante' },
					{	type: 'danger', z_index: 1111, placement:{from: "top", align: "center"},}
				);
			return false;
		}

		$("tbody").add("<tr id="+$estadoInicial+"_"+$quantidadeVizinhos+"><td>"+$estadoInicial+"</td><td>"
		+$quantidadeVizinhos+"</td><td>"+$estadoFinal+"</td></tr>").appendTo("tbody");

		if($estadoInicial == "Morta"){
			regras.morta[$quantidadeVizinhos] = $estadoFinal;
			console.log(regras);
			console.log(regras.morta);
		}else{
			regras.viva[$quantidadeVizinhos] = $estadoFinal;		
			console.log(regras);
			console.log(regras.viva);
		}

		//quantidadeDeRegras++;
		return true;
	}
	
	this.limparTabelaDeRegras = function(){
		$('tbody tr').remove();
		//quantidadeDeRegras=0;
		regras.limparRegras();
	}	
	
	this.excluirRegraManual = function(){
    	if(objMarcado!=null){
			id = objMarcado.attr("id").split("_");
			estadoIncial = id[0];
			vizinhos = id[1];
			regras.remove(estadoIncial, vizinhos)
			objMarcado.remove();
			//quantidadeDeRegras--;
		    return true;
		}
		//escrever mensagem mandando selecionar alguma regra
	    return false;
	}

}



canvas = new Canvas("ac:principal")
tabela = new Tabela()
canvas.inicializar(MORTA);



