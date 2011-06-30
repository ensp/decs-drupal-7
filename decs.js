/*
 * @file decs.js
 * JavaScript for decs.
 */
 
(function($) {
	$(document).ready(function() {
		
		var Decs = {};
		
		Decs.ENDERECO_AJAX = "http://localhost/drupal7_site1/";
		
		Decs.ALTURA_DA_CAIXA_DE_RESULTADO = 200;		
		
		Decs.IDIOMA_DEFAULT = "ptbr";
		
		Decs.passos = new Array();
				
		Decs.idioma = null; 
		
		Decs.mensagems_ptbr = {
			msg1:"Deseja remover o descritor: ",
			msg2:"mostrar descendentes do termo", // deletar esta mensagem
			msg3:"nenhum descritor encontrado para:",
			msg4:"1 descritor encontrado para:",
			msg5:" descritores encontrados para:",
			msg6:"O campo de busca está vazio.",			
			msg7:"use a barra de rolagem à direita para ver os descritores ocultos"			
		};
		
		/*
		 * Mensagens em outros idiomas, exemplo:
		 * 
		 * Decs.mensagems_enus = {
		 * 		msg1:"",
		 *		... 
		 * };
		 */	
		 
		Decs.procurarDescritoresPorPalavraChave_Ativo = false;
		Decs.obterDetalhesDoDescritor_Ativo = false; 		
		
				
		/*
		 * MÉTODOS PARA GERENCIAR OS ITENS DAS LISTAS DE DESCRITORES ENCONTRADOS/SELECIONADOS
		 */ 
		 
		Decs.criarItemParaListaDeDescritoresSelecionados = function(descritor) {			
			
			$("#decs-descritores-selecionados").append('<li>' + descritor + '</li>');
						
			$("#decs-descritores-selecionados li:last").click(function() {					
				if (confirm(Decs.obterMensagem("msg1") + descritor)) // msg: Deseja remover o descritor 					
					Decs.removerDescritorDaListaDeDescritoresSelecionados(descritor);
			});			
			
			$("#decs-descritores-selecionados li:last").mouseover(function() {
				$(this).addClass("decs-descritor-selecionado-over"); 					
			});		
			
			$("#decs-descritores-selecionados li:last").mouseout(function() {
				$(this).removeClass("decs-descritor-selecionado-over"); 					
			});						
		} 
				
		// Adiciona um descritor na lista de descritores selecionados.
		Decs.adicionarDescritorNaListaDeDescritoresSelecionados = function(descritor) {
		
			// realiza teste para não incluir um descritor duplicado
			
			var itensDaListaDeDescritores = $("#decs-descritores-selecionados li");
			var descritoresNaLista = new Array();
	
			for (var i=0; i<itensDaListaDeDescritores.length; i++)
				descritoresNaLista.push($(itensDaListaDeDescritores[i]).text());
		
			if (jQuery.inArray(descritor, descritoresNaLista) == -1) {				
				Decs.criarItemParaListaDeDescritoresSelecionados(descritor);													
				Decs.adicionarDescritorNoCampoOculto(descritor);
			}			
		}
		
		// Adiciona um descritor na lista de descritores encontrados.
		Decs.adicionarDescritorNaListaDeDescritoresEncontrados = function(descritor, id) {			
			
			$("#decs-descritores-encontrados").append(
			"<li><span class=\"decs-texto\">" + descritor + "</span>&nbsp;<span class=\"decs-icone-mais\">&nbsp;+&nbsp;</span></li>");					
						
			// clique do termo para adiciona-lo na lista de termos selecinados    
			$("#decs-descritores-encontrados li:last span:first").click(function() {
				Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor);
			});	
			
			// mouse over do termo para mudar sua aparência
			$("#decs-descritores-encontrados li:last span:first").mouseover(function() {
				$(this).addClass("decs-descritor-encontrado-over");				
			});			
			
			// mouseout do termo para restaurar aparência default
			$("#decs-descritores-encontrados li:last span:first").mouseout(function() {								
				$(this).removeClass("decs-descritor-encontrado-over");
			});			

			// clique do ícone navegar nos descendentes do termo
			$("#decs-descritores-encontrados li:last span:last").click(function() {
				Decs.obterDetalhesDoDescritor(descritor, id);				
			});				
			
			// mouseover do ícone para mudar sua aparência
			$("#decs-descritores-encontrados li:last span:last").mouseover(function() {
				$(this).addClass("decs-descritor-encontrado-icone-over");				
			});	
			
			// mouseout do ícone para restaurar aparência default
			$("#decs-descritores-encontrados li:last span:last").mouseout(function() {
				$(this).removeClass("decs-descritor-encontrado-icone-over");				
			});	
		}		
		
		// Remove um descritor da lista de descritores selecionados.
		Decs.removerDescritorDaListaDeDescritoresSelecionados = function(descritor) {
			
			var removerDescritorDoCampoOculto = false;
			var itensDaListaDeDescritores = $("#decs-descritores-selecionados li");
				
			for (var i=0; i<itensDaListaDeDescritores.length; i++) {
				if ($(itensDaListaDeDescritores[i]).text() == descritor) {
					$(itensDaListaDeDescritores[i]).remove();		
					removerDescritorDoCampoOculto = true;	
				}	
			}	
			
			if (removerDescritorDoCampoOculto)
				Decs.removerDescritorDoCampoOculto(descritor);
		}
		
		// Carrega lista de descritores selecionados.
		Decs.carregarListaDeDescritoresSelecionados = function() {
			
			var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();
			
			if (valorPreenchidoDoCampoString.split(" ").join("") != "") {
				
				var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");
				
				for (var i=0; i<valorPreenchidoDoCampoArray.length; i++)					
					Decs.criarItemParaListaDeDescritoresSelecionados(valorPreenchidoDoCampoArray[i]);
			}	
		}
		
		// Limpa lista de descritores encontrados para nova carga.
		Decs.removerTodosOsItensDaListaDeDescritoresEncontrados = function() {
			$("#decs-descritores-encontrados li").remove();		
		}
		
		// Recebe resultado da busca e atualiza lista de descritores encontrados. 
		Decs.atualizarListaDeDescritoresEncontrados = function(dados, mostrarQuantidadeDeDescritoresEncontrados) {
						
			var total = 0;
			var mensagem_alertaDeScroll = "";
			var mensagem_quatidade = "";
					
			for (item in dados) {				
				id = dados[item]['arvore_id'];
				Decs.adicionarDescritorNaListaDeDescritoresEncontrados(item, id);
				total++;
			}
			
			// mensagem de ajuda para usuário quando parte do resultado estiver oculta com barra de rolagem 				
			
			if (total > 0) {
				if ($("#decs-descritores-encontrados li:last").offset().top + $("#decs-descritores-encontrados li:last").outerHeight() >
					$("#decs-descritores-encontrados").offset().top + Decs.ALTURA_DA_CAIXA_DE_RESULTADO) {
					mensagem_alertaDeScroll = Decs.obterMensagem("msg7");
				}
			}
			
			$("#decs-mensagem2").text(mensagem_alertaDeScroll);
			$("#decs-mensagem2").fadeIn();			
			
			// mensagem com quantidade de descritores encontrados
			// esta mensagem só aparece para o resultado de uma busca   
			if (mostrarQuantidadeDeDescritoresEncontrados) {
								
				if (total == 0)
					mensagem_quatidade = Decs.obterMensagem("msg3");
				else if (total == 1)
					mensagem_quatidade	= Decs.obterMensagem("msg4");
				else
					mensagem_quatidade	= total + Decs.obterMensagem("msg5");			
				
				if (mensagem_quatidade != "")
					mensagem_quatidade += " " + $("#decs-campo-busca").val();	
				
				$("#decs-mensagem1").text(mensagem_quatidade);
				$("#decs-mensagem1").fadeIn();
			
			// a mensagem não aparece quando os detalhes (descritores descendentes) de um descritor estão em exibição
			} else {
				
				$("#decs-mensagem1").fadeOut();			
			}	
			
			Decs.esconderCortinaDeCarregamento();					
		}		
		
		
		/*
		 * MÉTODOS PARA GERENCIAR O VALOR DO CAMPO OCULTO COM DESCRITORES SELECIONADOS
		 */ 
		
		// Adiciona um descritor no campo oculto com lista de descritores selecionados,
		// chamada no método Decs.adicionarDescritorNaListaDeDescritoresSelecionados.
		Decs.adicionarDescritorNoCampoOculto = function(descritor) {
			
			// Realiza teste para não adicionar um descritor duplicado.
			// Este teste é redundante, pois existe um teste semelhante 
			// na função Decs.adicionarDescritorNaListaDeDescritoresSelecionados,
			// que é executado antes deste. Mas devido ao meu estilo defensivo 
			// este teste permanece aqui...
			
			var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();
			var valorAtualizadoDoCampoString = descritor;
			
			if (valorPreenchidoDoCampoString.split(" ").join("") != "") {				
				
				var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");
				
				valorAtualizadoDoCampoString = valorPreenchidoDoCampoString;
				
				if (jQuery.inArray(descritor, valorPreenchidoDoCampoArray) == -1)
					valorAtualizadoDoCampoString += ", " + descritor;
			}
			
			$("#decs-descriptors-field").val(valorAtualizadoDoCampoString);			
		} 		
		
		// Remove um decritor do campo oculto,
		// chamada no método Decs.removerDescritorDaListaDeDescritoresSelecionados.  
		Decs.removerDescritorDoCampoOculto = function(descritor) {
			
			var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();
			var valorAtualizadoDoCampoString = "";
			var valorAtualizadoDoCampoArray = new Array();
			
			if (valorPreenchidoDoCampoString.split(" ").join("") != "") {
				
				var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");
				
				if (valorPreenchidoDoCampoArray.length == 1) {
					
					if (valorPreenchidoDoCampoArray[0] != descritor)
						valorAtualizadoDoCampoString = valorPreenchidoDoCampoString;
				
				} else {
					
					for (var i=0; i<valorPreenchidoDoCampoArray.length; i++) {
						if (valorPreenchidoDoCampoArray[i] != descritor)
							valorAtualizadoDoCampoArray.push(valorPreenchidoDoCampoArray[i]);			
					}
					
					valorAtualizadoDoCampoString = (valorAtualizadoDoCampoArray.length == 1) ?
					valorAtualizadoDoCampoArray[0] : valorAtualizadoDoCampoArray.join(", "); 							
				} 
			}
			
			$("#decs-descriptors-field").val(valorAtualizadoDoCampoString);						
		}
		
		// Mostra cortina de carregamento.
		Decs.mostrarCortinaDeCarregamento = function() {						
			$("#decs-cortina").fadeIn();	
		}
		
		// Esconde cortina de carregamento.
		Decs.esconderCortinaDeCarregamento = function() {				
			$("#decs-cortina").fadeOut();	
		}		
		
		// Mostra detalhes do descritor.
		Decs.mostrarDefinicaoDoDescritor = function(definicao, quantidadeDeDescendentes) {
			
			var descendentes = "<em>Nenhum descritor relacionado.</em>"; 
			
			if (quantidadeDeDescendentes == 1)
				descendentes = "<em>Descritor Relacionado:</em>";		
			else if (quantidadeDeDescendentes > 1)							
				descendentes = "<em>Descritores Relacionados:</em>";	
			
			definicao += " " + descendentes;
					
			$("#decs-descritor-definicao-container .decs-descritor-definicao-texto").html(definicao);			
			
			Decs.posicionarCortina();
		}
		
		// Esconde detalhes do descritor.
		Decs.esconderDefinicaoDoDescritor = function() {			
			$("#decs-descritor-definicao-container .decs-descritor-definicao-texto").text("");						
			Decs.posicionarCortina();
		}
				
		/*
		 * PASSOS (migalha de pão)
		 */ 		
		
		Decs.inicializarPassos = function(descritor, id) {
			Decs.passos = new Array();
			$("#decs-passos li").remove();		
		}
					
		Decs.adicionarPasso = function(descritor, id) {			
			
			var passosGravados = Decs.passos.length;
			
			var seta = "&raquo; "; // var seta = (passosGravados > 0) ? "&raquo; " : "";			
			var ultimoDescritor = (passosGravados > 0) ? Decs.passos[passosGravados-1].descritor : null;
			
			if (ultimoDescritor != descritor) { 							
				Decs.passos.push({ "descritor":descritor, "id":id });			
				$("#decs-passos").append("<li>" + seta + descritor + "</li>");	
			}
			
			Decs.atualizarPassos();		
		}
		
		Decs.atualizarPassos = function() {
			
			var lis = $("#decs-passos li");
			
			$(lis).unbind("click");
			$(lis).unbind("mouseover");
			$(lis).unbind("mouseout");
			$(lis).removeClass("decs-passo-com-link");
			
			for (i=0; i<lis.length-1; i++) {
				$(lis[i]).addClass("decs-passo-com-link");
				$(lis[i]).click(function() {
					Decs.voltarParaUmPassoAnterior(this);
				});
			}
			
			if (lis.length > 1) {
				
				$("#decs-passos li:last").mouseover(function()
				{
					$(this).addClass("decs-passo-descritor-over");	
				});				
				
				$("#decs-passos li:last").mouseout(function()
				{
					$(this).removeClass("decs-passo-descritor-over");	
				});					
				
				$("#decs-passos li:last").click(function()
				{
					var descritor = jQuery.trim($(this).text().replace("» ", ""));
					Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor);	
				});				
			}	
		}
		
		Decs.voltarParaUmPassoAnterior = function(passo) {			
			
			var li;
			var lis = $("#decs-passos li");
			var descritor = jQuery.trim($(passo).text().replace("» ", ""));
			var passo = null;
			
			for (i=lis.length-1; i>0; i--) {
				
				li = $("#decs-passos li:last");	
				
				if (jQuery.trim(li.text().replace("» ", "")) == descritor)
					break;
				
				$(li).remove();
				Decs.passos.pop();
			}
			
			Decs.atualizarPassos();
			
			for (i in Decs.passos)
				if (Decs.passos[i].descritor == descritor)
					passo = Decs.passos[i];
			
			if (passo.id != null)
				Decs.obterDetalhesDoDescritor(passo.descritor, passo.id);
			else
				Decs.procurarDescritoresPorPalavraChave(passo.descritor);
			
			/*
			var passos_str = "";
			
			for (i in Decs.passos)
				passos_str += "» " + Decs.passos[i].descritor; 
							
			console.log(passos_str);	
			*/ 
		}
		
		
		/*
		 * AJAX
		 */ 
		
		Decs.procurarDescritoresPorPalavraChave = function(palavraChave) {						
			
			// flag para evitar execução paralela desta função
			if (Decs.procurarDescritoresPorPalavraChave_Ativo)
				return false;
			else	
				Decs.procurarDescritoresPorPalavraChave_Ativo = true;
				
			var texto = (palavraChave != null) ? palavraChave : $("#decs-campo-busca").val();			
			
			if (texto.split(" ").join("") == "") {
				alert(Decs.obterMensagem("msg6"));
				$("#decs-campo-busca").focus();
				return false;
			}	
			
			var enderecoAjax = Decs.ENDERECO_AJAX + "?q=decs/descritores/" + escape(texto);
			
			Decs.mostrarCortinaDeCarregamento();
			
			$("#decs-mensagem1").hide();
			$("#decs-mensagem2").text("");
			
			Decs.inicializarPassos();			
			Decs.removerTodosOsItensDaListaDeDescritoresEncontrados();
			Decs.esconderDefinicaoDoDescritor();
				
			jQuery.getJSON(enderecoAjax, function(dados) {								
				Decs.adicionarPasso(texto, null);
				Decs.atualizarListaDeDescritoresEncontrados(dados.descritores, true);
				Decs.procurarDescritoresPorPalavraChave_Ativo = false;
			});
		}		
		
		Decs.obterDetalhesDoDescritor = function(descritor, id) {
			
			// flag para evitar execução paralela desta função
			if(Decs.obterDetalhesDoDescritor_Ativo)
				return false;
			else	
				Decs.obterDetalhesDoDescritor_Ativo = true;
			
			var enderecoAjax = Decs.ENDERECO_AJAX + "?q=decs/descritor/" + id;
			
			Decs.mostrarCortinaDeCarregamento();
						
			jQuery.getJSON(enderecoAjax, function(dados) {								
				Decs.adicionarPasso(descritor, id);
				Decs.removerTodosOsItensDaListaDeDescritoresEncontrados();	
				Decs.atualizarListaDeDescritoresEncontrados(dados.resultado.descritores, false);			
				Decs.mostrarDefinicaoDoDescritor(dados.resultado.definicao, Decs.contarPropriedades(dados.resultado.descritores));
				Decs.esconderCortinaDeCarregamento();
				Decs.obterDetalhesDoDescritor_Ativo = false;
			});				
		}
		
		
		/*
		 * Funções Auxiliares
		 */ 
		 
		Decs.posicionarCortina = function() {			
			
			var c = $("#decs-descritor-cortina-container");
			var p = c.position();
			var t = Math.round(p.top) + "px"; 
			var w = Math.round(c.innerWidth())  + "px";
			var h = Math.round(c.innerHeight()) + "px";			
						
			$("#decs-cortina").css({ width:w, height:h, top:t });		
		}
		
		Decs.obterMensagem = function(idDaMensagem) {
			
			var idioma = (Decs.idioma != null) ? Decs.idioma : Decs.IDIOMA_DEFAULT;
			var mensagens = null;
			
			switch(idioma) {
				case "ptbr":
				mensagens = Decs.mensagems_ptbr;  
				break;	
				/*
				case "enus":
				mensagens = Decs.mensagems_enus;  
				break;
				*/ 							
			}
			
			if (mensagens == null)
				return null;
			else
				return mensagens[idDaMensagem];
		}
		
		// Dump recursivo para debug.
		Decs.dumpRecursivo = function(obj, shift) {								
			shift = (shift) ? "-----" + shift : "-----";				
			for(item in obj)								
				if (typeof(obj[item]) == "object")
					Decs.dumpRecursivo(obj[item], shift);	
				else
					console.log(shift + " " + item + ": " + obj[item]);
		}		
				
		// Conta propriedades em um objeto.		
		Decs.contarPropriedades = function(objeto) {
			var total = 0;
			for (i in objeto)
				total++;
			return total;	
		}		
				
		// Inicializador
		Decs.inicializar = function() {			
			
			// oculta campo decs_field
			$("#decs-descriptors-field").css("display", "none");
			
			Decs.posicionarCortina();
						
			// esconde cortina de carregamento
			$("#decs-cortina").hide();
						
			// carrega lista de descritores selecionados
			Decs.carregarListaDeDescritoresSelecionados();					

			$("#decs-botao-busca").click(function() {
				Decs.procurarDescritoresPorPalavraChave(null);
			});
		}
		
		Decs.inicializar();
	});
})(jQuery);






