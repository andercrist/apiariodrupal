$(function() {

  var createCORSRequest = function(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else xhr = null;
    return xhr;
  }

  //Mensagens de aviso
  var showInfo = function(message, type) {
    $('div.progress').hide();
    $('strong.message').text(message);
    $('div.alert').attr('class', 'alert alert-' + type)
    $('div.alert').show();
    setTimeout(function(){
      $('div.alert').hide();
    }, 4000);    
  };
  //Botão fechar do alerta
  $(document).on("focus", ".close", function() {
    $('div.alert').hide();
  });

  //Ao clicar no submit do formulário do drupal
  $('input[type="submit"]').on('click', function(evt) {
    //Verifica se o código de retorno foi inserido
    var codigo = $('#edit-apiario-codigo-und-0-value').val();
    //Caso o código esteja em branco envia o vídeo e aguarda o retorno do código
    if(codigo == "") {
      evt.preventDefault();
      //Caso o progress bar não estiver inserido, insere o mesmo
      if ($('.progress-striped').length == 0) {    
        var conteudo = '<div class="row">';
        conteudo +=  '<div class="span12">';
        conteudo +=    '<div class="progress progress-striped active hide">';
        conteudo +=      '<div style="width: 0%" class="bar"></div>';
        conteudo +=    '</div>';
        conteudo +=  '</div>';
        conteudo +='</div>';
        conteudo +='<div class="row">';
        conteudo +=  '<div class="span12">';
        conteudo +=    '<div class="alert hide">';
        conteudo +=      '<button type="button" data-dismiss="alert" class="close">x</button>';
        conteudo +=      '<span>';
        conteudo +=        '<strong class="message"></strong>';
        conteudo +=      '</span>';
        conteudo +=    '</div>';
        conteudo +=  '</div>';
        conteudo +='</div>';
        $(conteudo).insertAfter('#edit-actions');
      }
      //Pega o access_token do formulário
      var accesstoken = $('.apiario_accesstoken').val();
      //Pega a LINK do Upload
      var linkupload = $('.apiario_linkupload').val();
      //Caso o access token estiver em branco aborta o envio
      if(accesstoken == '') {
        //Mensagem para o usuário do erro
        showInfo('Access token não encontrado.', 'danger');
        return false;
      }
      //Caso nenhum vídeo seja selecionado, envia uma mensagem
      if( document.getElementById("edit-video").files.length == 0 ){
        showInfo('Selecione um vídeo para upload!', 'danger');
      } else {
        //Mostra o progress bar
        $('div.progress').show();
        //Cria um formulário com o vídeo a ser enviado
        var formData = new FormData();
        //Copia o arquivo
        var file = document.getElementById('edit-video').files[0];
        //Adiciona o arquivo ao formulário criado
        formData.append('video', file);
        
        //var xhr = new XMLHttpRequest();
        //Envia o vídeo para a APIario
        //xhr.open('post', linkupload, true);
        var xhr = createCORSRequest('POST', linkupload);
        //Seta o access token para enviar o arquivo
        xhr.setRequestHeader('Authorization','Bearer ' + accesstoken);
        //Insere as informações o progress bar
        xhr.upload.onprogress = function(e) {
          if (e.lengthComputable) {
            var percentage = (e.loaded / e.total) * 100;
            $('div.progress div.bar').html('Aguarde o envio do vídeo...');
            $('div.progress div.bar').css('width', percentage + '%');
            $('#edit-submit').attr('disabled', 'disabled');
            $('#edit-submit').attr('value', 'Aguarde o envio do vídeo...');
          }
        };
        //Retorno caso aconteça algum erro
        xhr.onerror = function(e) {
          showInfo('Ocorreu um erro ao enviar o formulário. Talvez o seu arquivo é muito grande.', 'danger');
        };
        //Ao concluir o envio
        xhr.onload = function() {
          //Trata o retorno em JSON para Object
          var resposta = jQuery.parseJSON(this.response);
          //Seta o código no campo
          $('#edit-apiario-codigo-und-0-value').val(resposta.id);
          //Seta o Status primário do vídeo no Jobs
          $('#edit-apiario-status-und-0-value').val('Processando...');
          //Remove o input do vídeo para evitar o envio para o drupal
          $('.form-item-files-video').remove();
          //Envia a mensagem de enviado com sucesso para o usuário
          showInfo(this.statusText + '. Vídeo enviado com sucesso! Aguarde o drupal salvar o vídeo...', 'success');
          //Habilita o botão salvar
          $('#edit-submit').attr('value', 'Salvar');
          $('#edit-submit').removeAttr('disabled');
          //Clica novamente no submit para salvar as informações no drupal
          $('input[type="submit"]').click();
        };
        //Envia o vídeo
        xhr.send(formData);
      }
      //Aborta o envio para o drupal enquanto o código não estiver OK e o vídeo OK
      return false;
    }    
  });
  //Se o código do vídeo estiver inserido o formulário envia as informações para o drupal serem salvas no segundo submit
});