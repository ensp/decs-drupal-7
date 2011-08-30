/**
 * @file
 *  JavaScript do módulo DeCS.
 * 
 * @author
 *  Alexandre Junqueira <afjunqueira@gmail.com>
 * 
 * @todo
 *  Inserir advertância da GPL.
 */

(function($) {
  $(document).ready(function() {

    var Decs = {};

    /**
     * CONSTANTES:
     * 
     */

    /**
     * Tolerância em segundos para aguardar a resposta do serviço DeCS.
     * 
     */
    Decs.TEMPO_MAXIMO_AJAX = 1; 

    /**
     * Idioma padrão das mensagens da interface de usuário.
     * 
     */
    Decs.IDIOMA_DEFAULT = "ptbr";

    /**
     * VARIÁVEIS:
     * 
     */
    
    /**
     * Estrutura com passos para navegar no resultado de uma busca.
     * Navegação estilo "migalhas de pão" (breadcrumb).
     * 
     */ 
    Decs.passos = new Array();

    /**
     * Idioma selecionado das mensagens exibidas para o usuário.
     * 
     * @todo
     *  Implementar interface administrativa para usuário escolher este parâmetro. 
     *  
     */ 
    Decs.idioma = null; 

    /**
     * @todo
     *  Criar mensagens em outros idiomas e mecanismo para escolher o idioma.
     * 
     */

    // Mensagens em português:
    
    Decs.mensagems_ptbr = {
    msg1:"Deseja remover o descritor:",
    msg2:"já está na lista de descritores selecionados.",
    msg3:"nenhum descritor encontrado para:",
    msg4:"1 descritor encontrado para:",
    msg5:"descritores encontrados para:",
    msg6:"O campo de busca está vazio.",
    msg7:"Use a barra de rolagem à direita para ver os descritores ocultos."
    };
    
    // Mensagens em outro idioma, exemplo: 

    /*
    Decs.mensagems_enus = {
      msg1:"",
      ... 
    };
    */

    // Altura da caixa de resultado com a lista de descritores encontrados.
    Decs.alturaDaCaixaDeResultado = null; 

    // Referência para função que realiza a interação com o serviço decs. 
    Decs.procurarDescritoresPorPalavraChave_ajax = null;
    
    /**
     * MANIPULAÇÕES DA INTERFACE. 
     * 
     */ 

    /**
     * Cria novo item na lista de descritores selecionados.
     * 
     * @param string  descritor 
     *  Texto correspondente ao descritor.
     * 
     * @see Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor)
     * @see Decs.carregarListaDeDescritoresSelecionados()
     * 
     */ 
    Decs.criarItemParaListaDeDescritoresSelecionados = function(descritor) {

      // Adiciona novo item na lista de descritores selecionados.
      $("#decs-descritores-selecionados").append('<li>' + descritor + '</li>');

      /**
       * Evento click: executa método para remover o descritor da lista.
       * 
       * @see Decs.removerDescritorDaListaDeDescritoresSelecionados(descritor)
       * 
       */
      $("#decs-descritores-selecionados li:last").click(function() {
        if (confirm(Decs.obterMensagem("msg1") + " " + descritor))
          Decs.removerDescritorDaListaDeDescritoresSelecionados(descritor);
      });

      /**
       * Evento mouseover: adiciona classe css para alterar a aparência do item;
       * 
       */
      $("#decs-descritores-selecionados li:last").mouseover(function() {
        $(this).addClass("decs-descritor-selecionado-over");
      });

      /**
       * Evento mouseout: adiciona classe css para alterar a aparência do item;
       * 
       */
      $("#decs-descritores-selecionados li:last").mouseout(function() {
        $(this).removeClass("decs-descritor-selecionado-over");
      });
    };

    /**
     * Adiciona um descritor na lista de descritores selecionados.
     * 
     * @param string descritor
     *  Texto correspondente ao descritor.
     * 
     */ 
    Decs.adicionarDescritorNaListaDeDescritoresSelecionados = function(descritor) {
      
      // Obtem itens (<li>) na lista de descritores selecionados. 
      var itensDaListaDeDescritores = $("#decs-descritores-selecionados li");
      
      // Estrutura para salvar o texto da cada item da lista.
      var descritoresNaLista = new Array();

      // Preenche estrutura com texto da cada item.
      for (var i=0; i<itensDaListaDeDescritores.length; i++)
        descritoresNaLista.push($(itensDaListaDeDescritores[i]).text());

      // Teste para evitar a criação de um item duplicado na lista de descritores selecionados.  
      if (jQuery.inArray(descritor, descritoresNaLista) == -1) {
        
        // Cria e adiciona novo item na lista de descritores selecioados. 
        Decs.criarItemParaListaDeDescritoresSelecionados(descritor);
        
        // Adiciona novo descritor no campo oculto com a lista de descritores selecionados.
        Decs.adicionarDescritorNoCampoOculto(descritor);
        
        // Efeito visual para chamar a atenção do usuário para o evento ocorrido.
        Decs.fade.fadeIt("decs-descritores-selecionados-titulo");
        
      } else {
        
        // Avisa usuário que o descritor já estava na lista de descritores selecionados.     
        alert("\"" + descritor + "\" " + Decs.obterMensagem("msg2"));
      }
    };

    /**
    * Adiciona um descritor na lista de descritores encontrados.
    * 
    * @param string descritor
    *   Texto correspondente ao descritor.
    * @param string id
    *   Id do descritor.
    * @param string idioma
    *   Idioma do descritor.
    *
    * @see Decs.atualizarListaDeDescritoresEncontrados(dados, mostrarQuantidadeDeDescritoresEncontrados)
    * 
    */
    Decs.adicionarDescritorNaListaDeDescritoresEncontrados = function(descritor, id, idioma) {

      // Adiciona novo item na lista de descritores encontrados.
      $("#decs-descritores-encontrados").append(
      "<li><span class=\"decs-texto\">" + descritor + "</span>&nbsp;<span class=\"decs-icone-mais\">&nbsp;+&nbsp;</span></li>");

      /**
       * Evento click do descritor:
       * Adiciona descritor na lista de descritores selecionados.
       * 
       * @see Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor)
       * 
       */ 
      $("#decs-descritores-encontrados li:last span:first").click(function() {
        Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor);
      });

      /**
       * Evento mouseover do descritor:
       * Adiciona classe css para alterar a aparência do item;
       * 
       */
      $("#decs-descritores-encontrados li:last span:first").mouseover(function() {
        $(this).addClass("decs-descritor-encontrado-over");
      });

      /**
       * Evento mouseout do descritor:
       * Adiciona classe css para alterar a aparência do item;
       * 
       */
      $("#decs-descritores-encontrados li:last span:first").mouseout(function() {
        $(this).removeClass("decs-descritor-encontrado-over");
      });

      /**
       * Evento click do ícone para navegar nos descendentes do termo:
       * Executa método para obter detalhes do descritor.
       * 
       * @see Decs.obterDetalhesDoDescritor(descritor, id, idioma)
       * 
       */
      $("#decs-descritores-encontrados li:last span:last").click(function() {
        Decs.obterDetalhesDoDescritor(descritor, id, idioma);
      });

      /**
       * Evento mouseout do ícone para navegar nos descendentes do termo:
       * Adiciona classe css para alterar a aparência do item;
       * 
       */
      $("#decs-descritores-encontrados li:last span:last").mouseover(function() {
        $(this).addClass("decs-descritor-encontrado-icone-over");
      });

      /**
       * Evento mouseout do ícone para navegar nos descendentes do termo:
       * Adiciona classe css para alterar a aparência do item;
       * 
       */
      $("#decs-descritores-encontrados li:last span:last").mouseout(function() {
        $(this).removeClass("decs-descritor-encontrado-icone-over");
      });
    };

    /**
     * Remove um descritor da lista de descritores selecionados.
     * 
     * @param string descritor
     *  Texto correspondente ao descritor.
     *
     */
    Decs.removerDescritorDaListaDeDescritoresSelecionados = function(descritor) {

      // Flag para remover descritor do campo oculto. 
      var removerDescritorDoCampoOculto = false;
      
      // Itens na lista de descritores selecionados.
      var itensDaListaDeDescritores = $("#decs-descritores-selecionados li");

      // Percorre itens na lista de descritores selecionados.
      for (var i=0; i<itensDaListaDeDescritores.length; i++) {
        
        // Remove descritor da lista.
        if ($(itensDaListaDeDescritores[i]).text() == descritor) {
          
          $(itensDaListaDeDescritores[i]).remove();
          
          // Atualiza flag para remover descritor do campo oculto com descritores selecionados.
          removerDescritorDoCampoOculto = true;
        }
      }

      // Teste para verificar se o descritor deve ser removido do campo oculto. 
      if (removerDescritorDoCampoOculto) {
        
        // Remove descritor do campo oculto.
        Decs.removerDescritorDoCampoOculto(descritor);
        
        // Efeito visual para chamar a atenção do usuário para o evento ocorrido.
        Decs.fade.fadeIt("decs-descritores-selecionados-titulo");
      }
    };

    /**
     * Obtem valor do campo oculto com a lista de descritores selecionados (separados po ","),
     * e carrega os descritores na lista (<ul>) de descritores selecionados.
     * 
     * @see Decs.inicializar()
     * 
     */
    Decs.carregarListaDeDescritoresSelecionados = function() {

      // Valor do campo oculto com lista dos descritores selecionados.
      var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();

      // Teste para verificar se o campo oculto está preenchido com algum valor.
      if (valorPreenchidoDoCampoString.split(" ").join("") != "") {

        // Usa o delimitador "," para criar uma coleção com os descritores.
        var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");

        // Adiciona descritores na lista de descritores selecionados.
        for (var i=0; i<valorPreenchidoDoCampoArray.length; i++)
          Decs.criarItemParaListaDeDescritoresSelecionados(valorPreenchidoDoCampoArray[i]);
      }
    };

    /**
     * Limpa lista de descritores encontrados.
     *
     */
    Decs.removerTodosOsItensDaListaDeDescritoresEncontrados = function() {
      $("#decs-descritores-encontrados li").remove();
    };

    /**
     * Recebe estrutura com resultado de uma busca (retorno do serviço DeCS), 
     * e atualiza a lista de descritores encontrados.
     * 
     * @param array dados
     *  Estrutura com descritores.
     * @param bollean mostrarQuantidadeDeDescritoresEncontrados
     *  Flag para mostrar quantidade de descritores encontrados.
     * @param string idioma
     *  Idioma do descritor.
     *  
     * @see Decs.procurarDescritoresPorPalavraChave(palavraChave)
     * @see Decs.obterDetalhesDoDescritor(descritor, id)
     * 
     */
    Decs.atualizarListaDeDescritoresEncontrados = function(dados, mostrarQuantidadeDeDescritoresEncontrados, idioma) {

      var total = 0;
      var mensagem_alertaDeScroll = "";
      var mensagem_quatidade = "";

      // Percorre estrutura com os descritores encontrados.  
      for (item in dados) {
        id = dados[item]['arvore_id'];
        Decs.adicionarDescritorNaListaDeDescritoresEncontrados(item, id, idioma);
        total++;
      }

      // Alerta usuário quando parte do resultado estiver oculta com barra de rolagem.
      if (total > 0) {
        if (
        $("#decs-descritores-encontrados li:last").offset().top + $("#decs-descritores-encontrados li:last").outerHeight() >
        $("#decs-descritores-encontrados").offset().top + Decs.alturaDaCaixaDeResultado) {
            mensagem_alertaDeScroll = Decs.obterMensagem("msg7");
        }
      }

      $("#decs-mensagem2").text(mensagem_alertaDeScroll);
      $("#decs-mensagem2").fadeIn();

      // Teste para verificar se a quantidade de descritores encontrados,
      // deve ser informada.  
      if (mostrarQuantidadeDeDescritoresEncontrados) {

        if (total == 0)
          mensagem_quatidade = Decs.obterMensagem("msg3");
        else if (total == 1)
          mensagem_quatidade = Decs.obterMensagem("msg4");
        else
          mensagem_quatidade = total + " " + Decs.obterMensagem("msg5");

        if (mensagem_quatidade != "")
          mensagem_quatidade += " " + $("#decs-campo-busca").val();

        $("#decs-mensagem1").text(mensagem_quatidade);
        $("#decs-mensagem1").fadeIn();

      // Esconde mensagem quando os detalhes de um descritor estão em exibição.
      } else {
        $("#decs-mensagem1").fadeOut();
      }

      // Esconde a cortina com o elemento gráfico que aparece durante um carregamento.
      Decs.esconderCortinaDeCarregamento();
    };

    /**
     * Adiciona um descritor no campo oculto.  
     * Este campo armazena uma lista de descritores separados pelo caractere ",",
     * para salvar na base de dados.
     *
     * @param string descritor
     *  Texto correspondente ao descritor. 
     * 
     * @see Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor)
     * 
     */ 
    Decs.adicionarDescritorNoCampoOculto = function(descritor) {

      // Obtem valores preenchidos no campo oculto.
      var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();
      
      // Estrutura para valor atualizado do campo oculto.
      var valorAtualizadoDoCampoString = descritor;

      // Teste para verificar se o campo oculto está preenchido com algum valor.
      if (valorPreenchidoDoCampoString.split(" ").join("") != "") {

        // Usa caractere "," para criar array de descritores.
        var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");
 
        valorAtualizadoDoCampoString = valorPreenchidoDoCampoString;

        // Teste para evitar a criação de um descritor duplicado. 
        if (jQuery.inArray(descritor, valorPreenchidoDoCampoArray) == -1)
          valorAtualizadoDoCampoString += ", " + descritor;
      }

      // Atualiza valor do campo oculto. 
      $("#decs-descriptors-field").val(valorAtualizadoDoCampoString);
    };

    /**
     * Remove um descritor do campo oculto.
     * 
     * @param string descritor
     *  Texto correspondente ao descritor. 
     * 
     * @see Decs.removerDescritorDaListaDeDescritoresSelecionados(descritor)
     * 
     */
    Decs.removerDescritorDoCampoOculto = function(descritor) {

        var valorPreenchidoDoCampoString = $("#decs-descriptors-field").val();
        var valorAtualizadoDoCampoString = "";
        var valorAtualizadoDoCampoArray = new Array();

        // Teste para verificar se o campo oculto está preenchido.
        if (valorPreenchidoDoCampoString.split(" ").join("") != "") {

          // Usa caractere "," para separar descritores em um array.
          var valorPreenchidoDoCampoArray = valorPreenchidoDoCampoString.split(", ");

          // Teste para verificar se há apenas um descritor na lista.
          if (valorPreenchidoDoCampoArray.length == 1) {

            // Teste para verificar se o único descritor da lista deve ser removido.
            if (valorPreenchidoDoCampoArray[0] != descritor)
              valorAtualizadoDoCampoString = valorPreenchidoDoCampoString;

          // Se existirem diversos descritores na lista...
          } else {

              // Percorre lista. 
              for (var i=0; i<valorPreenchidoDoCampoArray.length; i++) {
                
                // Teste para verificar se o descritor deve ser removido. 
                if (valorPreenchidoDoCampoArray[i] != descritor)
                  valorAtualizadoDoCampoArray.push(valorPreenchidoDoCampoArray[i]);
              }

              // Prepara string com valor atualizado do campo oculto.
              valorAtualizadoDoCampoString = (valorAtualizadoDoCampoArray.length == 1) ?
              valorAtualizadoDoCampoArray[0] : valorAtualizadoDoCampoArray.join(", ");
          } 
        }

        // Atualiza campo oculto.
        $("#decs-descriptors-field").val(valorAtualizadoDoCampoString);
    };

    /**
     * Mostra cortina de carregamento.
     * 
     */
    Decs.mostrarCortinaDeCarregamento = function() {
      $("#decs-cortina").fadeIn();
    };

    /**
     * Esconde cortina de carregamento.
     * 
     */
    Decs.esconderCortinaDeCarregamento = function() {
      $("#decs-cortina").fadeOut();
    };

    /**
     * Mostra detalhes com o texto de definição do descritor,
     * e a quantidade de descendentes.
     * 
     * @param string definicao
     *  Texto com definição do descritor.
     * @param string quantidadeDeDescendentes
     *  Quantidade de descendentes do descritor. 
     * 
     */
    Decs.mostrarDefinicaoDoDescritor = function(definicao, quantidadeDeDescendentes) {

      var descendentes = "<em>Nenhum descritor relacionado.</em>"; 

      if (quantidadeDeDescendentes == 1)
        descendentes = "<em>Descritor Relacionado:</em>";
      else if (quantidadeDeDescendentes > 1)
        descendentes = "<em>Descritores Relacionados:</em>";

      definicao += " " + descendentes;

      $("#decs-descritor-definicao-container .decs-descritor-definicao-texto").html(definicao);

      // Posiciona a cortina de carregamento. 
      Decs.posicionarCortina();
    };
    
    /**
     * Esconde detalhes com o texto de definição do descritor,
     * e a quantidade de descendentes.
     * 
     */
    Decs.esconderDefinicaoDoDescritor = function() {
      $("#decs-descritor-definicao-container .decs-descritor-definicao-texto").text("");
      Decs.posicionarCortina();
    };

    /**
     * Inicializa variável com passos para navegação em um resultado,
     * e limpa a lista de passos.  
     */ 
    Decs.inicializarPassos = function(descritor, id) {
      Decs.passos = new Array();
      $("#decs-passos li").remove();
    };

    /**
     * Adiciona na lista de passos, um objeto com informações de um passo.
     * 
     * Um passo é uma estrutura com os atributos:
     *
     *  descritor; 
     *  id;
     *  idioma.
     *
     * @param string descritor
     *  Texto de um descritor.
     * @param string id
     *  Id de um descritor.
     * @param string idioma
     *  Idioma de um descritor.
     *
     */ 
    Decs.adicionarPasso = function(descritor, id, idioma) {

      var passosGravados = Decs.passos.length;

      var seta = "&raquo; "; // var seta = (passosGravados > 0) ? "&raquo; " : "";
      var ultimoDescritor = (passosGravados > 0) ? Decs.passos[passosGravados-1].descritor : null;

      // Teste para evitar a duplicação do último descritor na lista de passos.  
      if (ultimoDescritor != descritor) {
        Decs.passos.push({ "descritor":descritor, "id":id, "idioma":idioma });
        $("#decs-passos").append("<li>" + seta + descritor + "</li>");
      }

      Decs.atualizarPassos();
    };

    /**
     * Atualiza lista de passos.
     * 
     */ 
    Decs.atualizarPassos = function() {

      // Obtem itens na lista de passos.
      var lis = $("#decs-passos li");

      // Remove eventos e estilo.
      $(lis).unbind("click");
      $(lis).unbind("mouseover");
      $(lis).unbind("mouseout");
      $(lis).removeClass("decs-passo-com-link");

      // Restaura estado original de cada item.
      for (i=0; i<lis.length-1; i++) {
        $(lis[i]).addClass("decs-passo-com-link");
        $(lis[i]).click(function() {
          Decs.voltarParaUmPassoAnterior(this);
        });
      }

      // Configura último item da lista.
      if (lis.length > 1) {

        /**
         * Evento mouseover:
         * Adiciona classe css para alterar a aparência do item;
         * 
         */
        $("#decs-passos li:last").mouseover(function() {
          $(this).addClass("decs-passo-descritor-over");
        });

        /**
         * Evento mouseout:
         * Adiciona classe css para alterar a aparência do item;
         * 
         */
        $("#decs-passos li:last").mouseout(function() {
          $(this).removeClass("decs-passo-descritor-over");
        });

        /**
         * Evento click do descritor:
         * Adiciona descritor na lista de descritores selecionados.
         * 
         * @see Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor)
         * 
         */ 
        $("#decs-passos li:last").click(function() {
          var descritor = jQuery.trim($(this).text().replace("» ", ""));
          Decs.adicionarDescritorNaListaDeDescritoresSelecionados(descritor);
        });
      }
    };

    /**
     * Volta para um passo anterior.
     * 
     * @param object passo
     *  Elemento <li>.
     * 
     */ 
    Decs.voltarParaUmPassoAnterior = function(passo) {

      var li;
      var lis = $("#decs-passos li");
      var descritor = jQuery.trim($(passo).text().replace("» ", ""));
      var passo = null;

      // Percorre lista do último item até o item que corresponde com
      // o argumento "passo".
      for (i=lis.length-1; i>0; i--) {

        li = $("#decs-passos li:last");

        // Teste para verificar se o item corresponde ao último passo.
        if (jQuery.trim(li.text().replace("» ", "")) == descritor)
          break;

        // Remove itens até encontrar o item correspondente ao último passo.
        $(li).remove();
          Decs.passos.pop();
      }

      Decs.atualizarPassos();

      // Obtem detalhes do passo.
      for (i in Decs.passos)
        if (Decs.passos[i].descritor == descritor)
          passo = Decs.passos[i];

      // Teste para verificar se o passo tem o id do descritor.
      if (passo.id != null)
        // Mostra os detalhes do descritor.
        Decs.obterDetalhesDoDescritor(passo.descritor, passo.id, passo.idioma);
      else
        // Procura descritor por palavra chave.
        Decs.procurarDescritoresPorPalavraChave(passo.descritor);
    };

    /**
     * INTERAÇÕES COM SERVIÇO DECS. 
     * 
     */
    
    /**
     * Procura descritores por palavra-chave.
     * 
     * @param string palavraChave
     *  Texto para busca.
     * 
     */ 
    Decs.procurarDescritoresPorPalavraChave = function(palavraChave) {

      var idioma = $("#decs-campo-idioma").val();
      var texto = (palavraChave != null) ? palavraChave : $("#decs-campo-busca").val();
      var enderecoAjax = unescape($("#decs-base").text()) + "/?q=decs/descritores/" + escape(texto) + "|" + idioma;
      var segundosRestantes = Decs.TEMPO_MAXIMO_AJAX;  
      var intervalId = null;
      var ajax = null;

      // Teste que verifica se existe uma string para a busca.
      if (texto.split(" ").join("") == "") {
        alert(Decs.obterMensagem("msg6"));
        $("#decs-campo-busca").focus();
        return false;
      }

      // Procedimentos para remover da interface os dados da busca anterior.
      Decs.mostrarCortinaDeCarregamento();
      Decs.inicializarPassos();
      Decs.removerTodosOsItensDaListaDeDescritoresEncontrados();
      Decs.esconderDefinicaoDoDescritor();

      $("#decs-mensagem1").hide();
      $("#decs-mensagem2").text("");

      // Conta tempo de espera da resposta do DeCS.

      clearInterval(intervalId);

      intervalId = setInterval(function() {

        // Teste para verificar se o limite de espera foi atingido.
        if (segundosRestantes > 0) {

          // Atualiza contador de segundos restantes.
          segundosRestantes--;

        // Se o tempo de espera esgotou...
        } else {

          clearInterval(intervalId);

          // Aborta chamada ao serviço DeCS.
          if (Decs.procurarDescritoresPorPalavraChave_ajax != null)
            Decs.procurarDescritoresPorPalavraChave_ajax.abort();

          Decs.esconderCortinaDeCarregamento();

          console.log("decs não respondeu e o tempo limite de espera esgotou");
        }
      }, 1000, null);

      // Aborta uma chamada ao serviço DeCS que possa estar em andamento,
      // para evitar chamadas comcorrentes.
      if (Decs.procurarDescritoresPorPalavraChave_ajax != null)
        Decs.procurarDescritoresPorPalavraChave_ajax.abort();

      // Envia requisição para o serviço DeCS. 
      Decs.procurarDescritoresPorPalavraChave_ajax = jQuery.getJSON(enderecoAjax, function(dados) {
        clearInterval(intervalId);
        Decs.procurarDescritoresPorPalavraChave_ajax = null;
        Decs.adicionarPasso(texto, null, idioma);
        Decs.atualizarListaDeDescritoresEncontrados(dados.descritores, true, idioma);
      });
    };

    /**
     * Obtem detalhes (descrição e descendentes) de um descritor.
     * 
     * @param string descritor
     *  Texto do descritor.
     * @param string id
     *  Id da árvore do descritor.
     * @param string idioma
     *  Idioma para exibição do resultado.
     * 
     */ 
    Decs.obterDetalhesDoDescritor = function(descritor, id, idioma) {

      var enderecoAjax = unescape($("#decs-base").text()) + "/?q=decs/descritor/" + id + "|" + idioma;

      Decs.mostrarCortinaDeCarregamento();

      jQuery.getJSON(enderecoAjax, function(dados) {
        Decs.adicionarPasso(descritor, id, null);
        Decs.removerTodosOsItensDaListaDeDescritoresEncontrados();
        Decs.atualizarListaDeDescritoresEncontrados(dados.resultado.descritores, false, idioma);
        Decs.mostrarDefinicaoDoDescritor(dados.resultado.definicao, Decs.contarPropriedades(dados.resultado.descritores));
        Decs.esconderCortinaDeCarregamento();
      });
    };

    /**
     * MISCELANEA. 
     * 
     */ 

    /**
     * Posiciona cortina.
     * 
     */ 
    Decs.posicionarCortina = function() {

      var c = $("#decs-descritor-cortina-container");
      var p = c.position();
      var t = Math.round(p.top) + "px"; 
      var w = Math.round(c.innerWidth())  + "px";
      var h = Math.round(c.innerHeight()) + "px";

      $("#decs-cortina").css({ width:w, height:h, top:t });
    };

    /**
     * Obtem texto da mensagem no idioma adequado. 
     * 
     * @param string idDaMensagem
     *  Identificador da mensagem.
     * 
     * @return null|string
     *  Texto da mensagem.
     * 
     */
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
    };

    /**
     * Dump recursivo para debug.
     *
     * @param any obj
     *  Uma variável de qualquer tipo de dado.
     * @param string shift
     *  Caracteres para formatar a saída.
     *
     */
    Decs.dumpRecursivo = function(obj, shift) {

      shift = (shift) ? "-----" + shift : "-----";

      for(item in obj)
        if (typeof(obj[item]) == "object")
          Decs.dumpRecursivo(obj[item], shift);
        else
          console.log(shift + " " + item + ": " + obj[item]);
    };

    /**
     * Conta propriedades em um objeto.
     *
     * @param object objeto
     *  Um objeto.
     *
     */
    Decs.contarPropriedades = function(objeto) {
      var total = 0;
      for (i in objeto)
        total++;
      return total;
    };

    /**
     * Aplica efeito estilo "highlight" em um elemento.
     * 
     */
    Decs.fade = {

      b : ["00","11","22","33","44","55","66","77","88","99","aa","bb","cc","dd","ee","ff"],
      count : 0, delay : 100, timeoutId : 0, ids : null,

      fadeIt : function (ids) {
        clearTimeout(Decs.fade.timeoutId);
        Decs.fade.ids = ids;
        Decs.fade.timeoutId = setTimeout(Decs.fade.setBackgroundColor, Decs.fade.delay);
      },

      setBackgroundColor : function () {

        var ids = Decs.fade.ids.toString();
        
        ids = ids.split(",");

        for (var i=0; i<ids.length; i++)
          document.getElementById(ids[i]).style.backgroundColor = "#ffff"+ Decs.fade.b[Decs.fade.count];

        if (Decs.fade.count++ < Decs.fade.b.length - 1)
          Decs.fade.fadeIt(ids);
        else
          Decs.fade.count = 0;
      }
    };

    /**
     * Inicializador.
     * 
     */
    Decs.inicializar = function() {      

      // Oculta campo decs_field, com lista de descritores separados por ",".
      $("#decs-descriptors-field").css("display", "none");

      Decs.posicionarCortina();

      // Esconde cortina de carregamento.
      $("#decs-cortina").hide();

      Decs.carregarListaDeDescritoresSelecionados();          

      // Evento click do botão "buscar".
      $("#decs-botao-busca").click(function() {
        Decs.procurarDescritoresPorPalavraChave(null);
      });

      // Altura inicial da caixa de resultado.
      Decs.alturaDaCaixaDeResultado = $("#decs-descritores-encontrados").css('height').replace("px", "");
    };

    Decs.inicializar();  
  });

})(jQuery);











