import DOM from "../library/libdom.js";

(function(win, doc){
  'use strict';

  const url = {
    base: 'https://viacep.com.br/ws/',
    dataType: '/json/'
  }
  const $cep = new DOM('[data-js="cep"]');
  const $form = new DOM('[data-js="form"]');
  const $contMain = new DOM('[data-js="contents"]');
  
  $form.on('submit', handlerFormCEP);
  
  function handlerFormCEP(evt) {
    evt.preventDefault();
    var cep = clearCEP();
    if(!isValidCEP(cep)) {
      setElementInDOM('CEP deve ter 8 carateres!');
      return;
    }
    requestXHR(function() {
      if(this.readyState === this.LOADING) {
        setElementInDOM('Buscando informações para o CEP ' + formatCEP(cep) + '...');
      }
      if(hasResponseError(this)) {
        setElementInDOM('Não encontramos o endereço para o CEP ' + formatCEP(cep) + '.');
      }
      if(validStatusOfXHR(this) && !hasResponseError(this)) {
        let objResponse = JSON.parse(this.responseText);
        clearInputCEP();
        setTimeout(() => { 
          ifExistReplaceElseAdd(createDocFrament(objResponse, cep), $contMain.get()[0]) 
        }, 3000);
      }
    }, wrapCEPWithURL(cep));
  }
  
  function requestXHR(handlerRequestfn, url) {
    let xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', handlerRequestfn);
    xhr.open('GET', url);
    xhr.send();
  }

  function createElementMsg(textContent) {
    let $divCont = doc.createElement('div');
    let $span = doc.createElement('span');
    $divCont.setAttribute('data-js', 'msg');
    $divCont.setAttribute('class', 'cont-msg');
    $span.appendChild(doc.createTextNode(textContent));
    $divCont.appendChild($span);
    return $divCont;
  }

  function createDocFrament(obj, cep) {
    let $docFragment = doc.createDocumentFragment();
    let $contData = doc.createElement('div');
    $contData.setAttribute('class', 'cont-data');

    $contData.appendChild(createElementMsg('Endereço referente ao CEP ' + formatCEP(cep) + ':'));
    $contData.appendChild(mountTables(obj));
    $docFragment.appendChild($contData);
    return $docFragment;
  }

  function mountTables(obj) {
    return createElementTable(
      createLineOfTable('th', Object.keys(obj).map(el => el.toUpperCase())),
      createLineOfTable('td', obj)
    );
  }

  function createElementTable() {
    let $table = doc.createElement('table');
    let $tbody = doc.createElement('tbody');
    let $thead = doc.createElement('thead');
    Array.prototype.forEach.call(arguments, (el, index) => {
      if(index === 0 && el.firstElementChild.nodeName === 'TH') {
        $thead.appendChild(el);
      } else {
        $tbody.appendChild(el);
      }
    });
    $table.append($thead, $tbody);
    return $table;
  }

  function createLineOfTable(tagName, obj) {
    let $tr = doc.createElement('tr');
    for(let prop in obj) {
      let $th = doc.createElement(tagName);
      $th.appendChild(doc.createTextNode(obj[prop] || 'Empty'));
      $tr.appendChild($th);
    }
    return $tr;
  }

  function isValidCEP(cep) {
    if(cep.length === 8) {
      return true;
    }
    return false;
  }

  function clearCEP() {
    return $cep.get()[0].value.replace(/\D/g, '');
  }

  function wrapCEPWithURL(cep) {
    return url.base + cep + url.dataType;
  }

  function hasLastChild() {
    return $contMain.get()[0].firstElementChild.nextElementSibling;
  }

  function ifExistReplaceElseAdd(newElement, parent)
  {
    if(hasLastChild()) {
      parent.replaceChild(newElement, parent.lastElementChild);
      return;
    }
    parent.appendChild(newElement);
  }

  function validStatusOfXHR(xhr) {
    return xhr.status === 200 && xhr.readyState === 4;
  }

  function formatCEP(cep) {
    return cep.replace(/(\d{5})(\d+)/, '$1-$2');
  }

  function clearInputCEP() {
    $cep.get()[0].value = '';
  }

  function hasResponseError(objxhr) {
    if(validStatusOfXHR(objxhr)) {
      return JSON.parse(objxhr.responseText).erro;
    }
    return false;
  }

  function setElementInDOM(msg) {
    ifExistReplaceElseAdd(createElementMsg(msg), $contMain.get()[0]);
  }
})(window, document);
