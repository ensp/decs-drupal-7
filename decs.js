/*
 * @file decs.js
 * JavaScript for decs.
 */
 
(function($) {
	$(document).ready(function() {
		
		var Decs = {};
		
		Decs.ALTURA_DA_CAIXA_DE_RESULTADO = 200;
		
		/*
		 * MÉTODOS PARA GERENCIAR OS ITENS DAS LISTAS DE DESCRITORES ENCONTRADOS/SELECIONADOS
		 */ 
				
		// Adiciona um descritor na lista de descritores selecionados.
		Decs.adicionarDescritorNaListaDeDescritoresSelecionados = function(descritor) {
		
			// realiza teste para não incluir um descritor duplicado
			
			var itensDaListaDeDescritores = $("#decs-descritores-selecionados li");
			var descritoresNaLista = new Array();
	
			for (var i=0; i<itensDaListaDeDescritores.length; i++)
				descritoresNaLista.push($(itensDaListaDeDescritores[i]).text());
		
			if (jQuery.inArray(descritor, descritoresNaLista) == -1) {
				$("#decs-descritores-selecionados").append('<li>' + descritor + '</li>');
				$("#decs-descritores-selecionados li:last").click(function() {					
					if (confirm("Deseja remover o descritor: " + descritor))					
						Decs.removerDescritorDaListaDeDescritoresSelecionados(descritor);
				});					
				Decs.adicionarDescritorNoCampoOculto(descritor);
			}			
		};
		
		// Adiciona um descritor na lista de descritores encontrados.
		Decs.adicionarDescritorNaListaDeDescritoresEncontrados = function(descritor) {			
			$("#decs-descritores-encontrados").append('<li><span>' + descritor + '</span></li>');					
			$("#decs-descritores-encontrados li:last").click(function() {
				Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor);
			});	
			$("#decs-descritores-encontrados li:last span").mouseover(function() {
				$(this).addClass("decs-descritor-selecionado");
			});			
			$("#decs-descritores-encontrados li:last span").mouseout(function() {
				$(this).removeClass("decs-descritor-selecionado");
			});												
		};		
		
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
				
				for (var i=0; i<valorPreenchidoDoCampoArray.length; i++) {
					$("#decs-descritores-selecionados").append('<li>' + valorPreenchidoDoCampoArray[i] + '</li>');
					$("#decs-descritores-selecionados li:last").click(function() {
						if (confirm("Deseja remover o descritor: " + $(this).text()))	
							Decs.removerDescritorDaListaDeDescritoresSelecionados($(this).text());
					});				
				}								
			}	
		}
		
		Decs.removerTodosOsItensDaListaDeDescritoresEncontrados = function() {
			$("#decs-descritores-encontrados li").remove();				
		}
		
		// recebe resultado da busca e atualiza lista de descritores encontrados 
		Decs.atualizarListaDeDescritoresEncontrados = function(dados) {
			
			Decs.removerTodosOsItensDaListaDeDescritoresEncontrados();
			
			var total = 0;
					
			for (item in dados) {				
				idDaArvoreDoDescritor = dados[item]['arvore_id'];
				Decs.adicionarDescritorNaListaDeDescritoresEncontrados(item);
				total++;
			}
						
			var mensagem_alertaDeScroll = "";
			
			if ($("#decs-descritores-encontrados li:last").offset().top + $("#decs-descritores-encontrados li:last").outerHeight() >
				$("#decs-descritores-encontrados").offset().top + Decs.ALTURA_DA_CAIXA_DE_RESULTADO) {
				mensagem_alertaDeScroll = " (use a barra de rolagem para ver os descritores ocultos)";
			}
			
			var mensagem_quatidade = "";
			
			if (total == 0)
				mensagem_quatidade = "nenhum descritor encontrado";
			else if (total == 1)
				mensagem_quatidade	= "1 descritor encontrado";
			else
				mensagem_quatidade	= total + " descritores encontrados";			
			
			$("#decs-mensagem").text(mensagem_quatidade + " " + mensagem_alertaDeScroll);
			$("#decs-mensagem").fadeIn();				
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
		} ; 		
		
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
		
		/*
		 * AJAX
		 */ 

		Decs.procurarDescritoresPorPalavraChave = function() {			
						
			var enderecoAjax = "http://localhost/drupal7_site1/?q=decs/descritores/" + $("#decs-campo-busca").val();
			
			$("#decs-mensagem").hide();
				
			jQuery.getJSON(enderecoAjax, function(dados) {				
				Decs.atualizarListaDeDescritoresEncontrados(dados.descritores);
			});
		}		
		
		// Inicializador.
		Decs.inicializar = function() {			
			
			// oculta campo decs_field
			$("#decs-descriptors-field").css("display", "none");
			
			Decs.carregarListaDeDescritoresSelecionados();					

			$("#decs-botao-busca").click(function() {
				Decs.procurarDescritoresPorPalavraChave();
			});
		};
		
		Decs.inicializar();

	});
})(jQuery);

