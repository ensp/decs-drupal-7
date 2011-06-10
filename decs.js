/*
 * @file decs.js
 * JavaScript for decs.
 */
 
(function($) {
	$(document).ready(function() {
	 
		// oculta campo decs_field
		// $('#decs-descriptors-field').css('display', 'none');
		
		var Decs = {};
		
		// Adiciona um descritor na lista de descritores selecionados.
		Decs.adicionarDescritorNaListaDeDescritoresSelecionados = function(descritor) {
		
			// realiza teste para não incluir um descritor duplicado
			
			var itensDaListaDeDescritores = $("#decs-selected-descriptors li");
			var descritoresNaLista = new Array();
	
			for (var i=0; i<itensDaListaDeDescritores.length; i++)
				descritoresNaLista.push($(itensDaListaDeDescritores[i]).text());
		
			if (jQuery.inArray(descritor, descritoresNaLista) == -1) {
				$("#decs-selected-descriptors").append('<li>' + descritor + '</li>');
				$("#decs-selected-descriptors li:last").click(function() {					
					if (confirm("Deseja remover o descritor: " + descritor))					
						Decs.removerDescritorDaListaDeDescritoresSelecionados(descritor);
				});					
				Decs.adicionarDescritorNoCampoOculto(descritor);
			}			
		};
		
		// Adiciona um descritor na lista de descritores encontrados.
		Decs.adicionarDescritorNaListaDeDescritoresEncontrados = function(descritor) {			
			$("#decs-found-descriptors").append('<li>' + descritor + '</li>');					
			$("#decs-found-descriptors li:last").click(function() {
				Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor);
			});			
		};
		
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
		
		// Remove um descritor da lista de descritores selecionados.
		Decs.removerDescritorDaListaDeDescritoresSelecionados = function(descritor) {
			
			var removerDescritorDoCampoOculto = false;
			var itensDaListaDeDescritores = $("#decs-selected-descriptors li");
				
			for (var i=0; i<itensDaListaDeDescritores.length; i++) {
				if ($(itensDaListaDeDescritores[i]).text() == descritor) {
					$(itensDaListaDeDescritores[i]).remove();		
					removerDescritorDoCampoOculto = true;	
				}	
			}	
			
			if (removerDescritorDoCampoOculto)
				Decs.removerDescritorDoCampoOculto(descritor);
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
		
		// Carrega lista de descritores selecionados.
		Decs.carregarListaDeDescritoresSelecionados = function() {
			
			var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();
			
			if (valorPreenchidoDoCampoString.split(" ").join("") != "") {
				
				var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");
				
				for (var i=0; i<valorPreenchidoDoCampoArray.length; i++) {
					$("#decs-selected-descriptors").append('<li>' + valorPreenchidoDoCampoArray[i] + '</li>');
					$("#decs-selected-descriptors li:last").click(function() {
						if (confirm("Deseja remover o descritor: " + $(this).text()))	
							Decs.removerDescritorDaListaDeDescritoresSelecionados($(this).text());
					});				
				}								
			}	
		}
		
		// AJAX

		Decs.procurarDescritoresPorPalavraChave = function() {			
			
			var enderecoAjax = "http://localhost/drupal7_site1/?q=decs/descritores/" + $("#decs-search-field").val();
				
			jQuery.getJSON(enderecoAjax, function(data) {				
				alert('resposta ajax');
			});
		}		
		
		// Inicializador.
		Decs.inicializar = function() {			

			Decs.adicionarDescritorNaListaDeDescritoresEncontrados('descritor 1');
			Decs.adicionarDescritorNaListaDeDescritoresEncontrados('descritor 2');
			Decs.adicionarDescritorNaListaDeDescritoresEncontrados('descritor 3');
			Decs.adicionarDescritorNaListaDeDescritoresEncontrados('descritor 4');
			Decs.adicionarDescritorNaListaDeDescritoresEncontrados('descritor 5');	
			
			Decs.carregarListaDeDescritoresSelecionados();					

			$("#decs-search-button").click(function() {
				Decs.procurarDescritoresPorPalavraChave();
			});
		};
		
		Decs.inicializar();

	});
})(jQuery);

