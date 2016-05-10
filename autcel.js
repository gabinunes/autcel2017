
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


    var processarRegras = function(celula) {
        //TODO Inserir Regras 
        vizinhas = getQuantidadeDeVizinhas(celula);
        if (celula.isViva() && (vizinhas < 2 || vizinhas > 3)) {
            return new Celula(celula.getPosicaoX(), celula.getPosicaoY(), MORTA);
        }
        if (!celula.isViva() && vizinhas === 3) {
            return new Celula(celula.getPosicaoX(), celula.getPosicaoY(), VIVA);
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

	this.criarRegraManual = function(){
		var quantRegras = 0;
		$estadoInicial = $('input[name="estadoinicial"]:checked').val();
		$quantidadeVizinhos = $('#vizinhos option:selected').val();
		$estadoFinal = $('input[name="estadofinal"]:checked').val();
		
		//verificar se já existe pra poder adicionar

		$("tbody").add("<tr><td><p>"+$estadoInicial+"</p></td><td><p>"+$quantidadeVizinhos+"</p></td><td><p>"+$estadoFinal+"</p></td></tr>").appendTo("tbody");

		quantRegras++;

	}
	
	this.excluirRegraManual = function(){
		//Remove tudo $('tbody tr').remove();
    	objMarcado.remove();
	    return false;
	}
}

$("tbody").on('click', 'tr', function () {
	objMarcado = this;
    $(this).siblings().removeClass('marcada');	
    $(this).toggleClass('marcada');
});



canvas = new Canvas("ac:principal")
canvas.inicializar(MORTA);




