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



function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}

var notificar = function(mensagem, tipo) {
	$.notify(
		{ message: mensagem },
		{type: tipo, z_index: 1111, placement:{from: "top", align: "center"},}
	);
}

//ObjetoRegras

var regras = {
		viva: {0:"Morta", 1:"Morta", 4:"Morta", 5:"Morta", 6:"Morta", 7:"Morta", 8:"Morta"},
		morta: {3:"Viva"},
		limparRegras: function(){ 
			this.morta = {}
			this.viva = {}
		},		

		remove: function(estadoInicial, vizinhos) {
	     		delete  this[estadoInicial.toLowerCase()][vizinhos];
		},
		
		restaurarPadrao: function() {
			this.viva = {0:"Morta", 1:"Morta", 4:"Morta", 5:"Morta", 6:"Morta", 7:"Morta", 8:"Morta"};
			this.morta = {3:"Viva"};
		},

		downloadRegras: function(){
			var a = document.createElement("a");
			$("body").append(a);
			var arquivo = new Blob([JSON.stringify(regras)],{type:'application/json'});
			a.href = URL.createObjectURL(arquivo);
			a.type = 'application/json';
			a.download = 'regras.json';
			a.click();
			$(a).remove();
		},


		parseRegra : function(regra) {
			result = {};
			for(var vizinho in regra) {
				qnt_vizinho = parseInt(vizinho);
				if(isNaN(qnt_vizinho) || qnt_vizinho < 0 || qnt_vizinho > 8 || !regra.hasOwnProperty(vizinho))
					 continue;
						
				var estadoFinal = regra[vizinho].toLowerCase();
				if( estadoFinal === "morta" || estadoFinal === "viva" ) {
					result[vizinho] = estadoFinal;					
				}
			}
			return result;
		},

		carregarRegras : function(reader) {
			try{
				var regra = JSON.parse(reader.result);
				tabela.limparTabelaDeRegras();
				if(regra.hasOwnProperty("viva")) {
					this.viva = this.parseRegra(regra["viva"]);
				}
				if(regra.hasOwnProperty("morta")) {
					this.morta = this.parseRegra(regra["morta"]);
				}
				tabela.inicializarTabela();
			} catch(error) {
				notificar("Verifique o conteúdo do arquivo!", "danger");
			}
		},

		uploadRegras: function(){
			var input = document.createElement("input");
			$("body").append(input);
			
			input.type = "file";
			input.style = "display: none";
			var self = this;
			input.addEventListener('change', function(e) {
				var arquivo = input.files[0];

				if (arquivo.type.match("application/json")) {
					var reader = new FileReader();

				reader.onload = function(e) {
					self.carregarRegras(reader);
				}

				reader.readAsText(arquivo);	
			} else {
				notificar("Tipo de arquivo inválido! permitido apenas arquivos 'application/json'", 'danger');
			}
			});
			input.click();
			$(input).remove();
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
       
        document.getElementById("geracao").innerHTML = ++geracao;

		for (var posicaoX = 0; posicaoX < largura; posicaoX++) {
            for (var posicaoY = 0; posicaoY < altura; posicaoY++) {
                if (novaGeracao[posicaoX][posicaoY] != celulas[posicaoX][posicaoY]){
					celulas = novaGeracao;
					return;
				}
                
            }
		}
        this.pararSimulacao();

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

        if (!celula.isViva() && regras.morta[vizinhas]!=undefined) {
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
		geracao = 0;
		TAMANHO_DA_CELULA = tamanho;
		this.inicializar(MORTA);
	}

	this.setVelocidade = function(espera){
		geracao = 0;
		ESPERA_ENTRE_GERACOES = espera;
		this.inicializar(MORTA);
	}

	this.setTamanhoMatriz = function(altura,largura){
		geracao = 0;
		canvas.height = altura;
		canvas.width = largura;
		this.inicializar(MORTA);
	}


	this.considerarExtremidades = function(estado){
		geracao = 0;
		CONSIDERAR_EXTREMIDADES = estado;
		this.inicializar(MORTA);
		
	}

}

function Tabela(){

	var objMarcado = null;

	$("tbody").on('click', 'tr', function () {
		objMarcado = $(this);
		$(this).siblings().removeClass('marcada');	
		$(this).toggleClass('marcada');
		if(!$(this).hasClass('marcada')) {
			objMarcado = null;
		}
	});

	
	this.inicializarTabela = function() {
		for (var estado in regras) {
			// se for atributo de superclass não verifica
			if (!regras.hasOwnProperty(estado)) continue;

			var regra = regras[estado];
    			for (var vizinhos in regra) {
				// se for atributo de superclass não verifica
			        if(!regra.hasOwnProperty(vizinhos)) continue;
				adicionarRegraNaTabela(capitalize(estado), vizinhos, regra[vizinhos]);
 			}
		}
	}

	var adicionarRegraNaTabela = function(estadoInicial, quantidadeDeVizinhos, estadoFinal) {
		$("tbody").add("<tr id="+estadoInicial+"_"+quantidadeDeVizinhos+"><td>"+estadoInicial+"</td><td>"
		+quantidadeDeVizinhos+"</td><td>"+estadoFinal+"</td></tr>").appendTo("tbody");
	}

	var adicionarRegra = function(estadoInicial, quantidadeDeVizinhos, estadoFinal) {
		regras[estadoInicial.toLowerCase()][quantidadeDeVizinhos] = estadoFinal;
	}

	this.criarRegraManual = function(){
		$estadoInicial = $('input[name="estadoinicial"]:checked').val();
		$quantidadeVizinhos = $('#vizinhos option:selected').val();
		$estadoFinal = $('input[name="estadofinal"]:checked').val();

		$tr = $("#"+$estadoInicial+"_"+$quantidadeVizinhos);
		if ($tr.length > 0){
			if($tr.children(":last").html() == $estadoFinal){
				notificar('Regra já inserida anteriormente', 'danger');
				return false;
			}

			notificar('Regra Conflitante', 'danger');
			return false;
		}

		adicionarRegraNaTabela($estadoInicial, $quantidadeVizinhos, $estadoFinal);

		adicionarRegra($estadoInicial, $quantidadeVizinhos, $estadoFinal);

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
			estadoInicial = id[0];
			vizinhos = id[1];
			regras.remove(estadoInicial, vizinhos)
			objMarcado.remove();
			//quantidadeDeRegras--;
		    return true;
		}
		//escrever mensagem mandando selecionar alguma regra
	    return false;
	}

	this.restaurarRegrasPadrao = function(){
		tabela.limparTabelaDeRegras();
		regras.restaurarPadrao();
		tabela.inicializarTabela();
	
	}

}



canvas = new Canvas("ac:principal")
tabela = new Tabela()
tabela.inicializarTabela();
canvas.inicializar(MORTA);



