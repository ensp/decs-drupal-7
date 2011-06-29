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
			msg3:"nenhum descritor encontrado",
			msg4:"1 descritor encontrado",
			msg5:" descritores encontrados",
			msg6:"O campo de busca está vazio.",			
			msg7:"use a barra de rolagem para ver os descritores ocultos"			
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
				// alert(id);
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
		
		// Limpa lista de descritores encontrados para nova carga
		Decs.removerTodosOsItensDaListaDeDescritoresEncontrados = function() {
			$("#decs-descritores-encontrados li").remove();				
		}
		
		// recebe resultado da busca e atualiza lista de descritores encontrados 
		Decs.atualizarListaDeDescritoresEncontrados = function(dados) {
						
			var total = 0;
					
			for (item in dados) {				
				id = dados[item]['arvore_id'];
				Decs.adicionarDescritorNaListaDeDescritoresEncontrados(item, id);
				total++;
			}
						
			var mensagem_alertaDeScroll = "";
			
			if (total > 0) {
				if ($("#decs-descritores-encontrados li:last").offset().top + $("#decs-descritores-encontrados li:last").outerHeight() >
					$("#decs-descritores-encontrados").offset().top + Decs.ALTURA_DA_CAIXA_DE_RESULTADO) {
					mensagem_alertaDeScroll = Decs.obterMensagem("msg7");
				}
			}
			
			var mensagem_quatidade = "";
			
			if (total == 0)
				mensagem_quatidade = Decs.obterMensagem("msg3");
			else if (total == 1)
				mensagem_quatidade	= Decs.obterMensagem("msg4");
			else
				mensagem_quatidade	= total + Decs.obterMensagem("msg5");			
			
			$("#decs-mensagem1").text(mensagem_quatidade);
			$("#decs-mensagem1").fadeIn();	

			$("#decs-mensagem2").text(mensagem_alertaDeScroll);
			$("#decs-mensagem2").fadeIn();		
			
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
		
		// mostra cortina de carregamento
		Decs.mostrarCortinaDeCarregamento = function() {						
			Decs.redimensionarCortina();			
			$("#decs-cortina").fadeIn();	
		}
		

		// esconder cortina de carregamento
		Decs.esconderCortinaDeCarregamento = function() {				
			$("#decs-cortina").fadeOut();	
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
			$(lis).removeClass("decs-passo-com-link");
			
			for (i=0; i<lis.length-1; i++) {
				$(lis[i]).addClass("decs-passo-com-link");
				$(lis[i]).click(function() {
					Decs.voltarParaUmPassoAnterior(this);
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
				
			jQuery.getJSON(enderecoAjax, function(dados) {								
				Decs.adicionarPasso(texto, null);
				Decs.atualizarListaDeDescritoresEncontrados(dados.descritores);
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
				// dados.resultado;
				Decs.adicionarPasso(descritor, id);
				Decs.removerTodosOsItensDaListaDeDescritoresEncontrados();	
				Decs.atualizarListaDeDescritoresEncontrados(dados.resultado.descritores);			
				Decs.esconderCortinaDeCarregamento();
				Decs.obterDetalhesDoDescritor_Ativo = false;
			});				
		}
		
		
		/*
		 * Funções Auxiliares
		 */ 
		 
		Decs.redimensionarCortina = function() {			
						
			// configura dimenções da cortina de carregamento
			var c = $("#decs-descritores-encontrados");
			var w = c.innerWidth()  + "px";
			var h = c.innerHeight() + "px";
						
			$("#decs-cortina").css({ width:w, height:h });		
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
				
		// Inicializador
		Decs.inicializar = function() {			
			
			// oculta campo decs_field
			$("#decs-descriptors-field").css("display", "none");

			// posiciona cortina de carregamento						
			var r = $("#decs-descritores-encontrados");
			var t = Math.round(r.offset().top);
			var l = Math.round(r.offset().left);
						
			$("#decs-cortina").offset({ top:t, left:l });
			
			Decs.redimensionarCortina();
						
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






