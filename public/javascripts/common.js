(function(){

	Element.implement({
		moveTo: function(element){
			var clone = this.clone();
			clone.inject(element, 'top');
			clone.highlight();
			this.destroy();
		},
		
		highlight: function(start, end){
			if (!end){
				end = this.retrieve('highlight:original', this.getStyle('background-color'));
				end = (end == 'transparent') ? '#F7F9F8' : end;
			}
			var tween = this.get('tween');
			tween.start('background-color', start || '#ffff88', end).chain(function(){
				this.setStyle('background-color', this.retrieve('highlight:original'));
				tween.callChain();
			}.bind(this));
			return this;
		},
		
		listInfo: function(mode){
			this.getParent('form').getElement('.noTasks')[mode]();
		}
	});

	var AsapList = this.AsapList = new Class({

		todo: {},

		initialize: function(presetList){
			self = this;
			this.todo = presetList;
			this.template = '<li data-id="{id}" data-title="{title}"><input type="checkbox" /> <span>{title}</span> <a href="#">Delete</a></li>';
			this.activeTemplate = '';
			this.doneTemplate = '';
			this.element = {
				activeList: document.id('active-todo'),
				doneList: document.id('done-todo'),
				lists: document.getElements('ul'),
				omnibox: document.id('omni-box'),
				agent: document.id('agent')
			};

			this.setup();
		},

		setup: function(){
			this.element.agent.set('tween', {
				link: 'chain'
			});
			this.populateLists();
			this.moveFromList();
			this.addItem();
		},
		
		populateLists: function(){
			
			// populate the active items
			this.populateList(this.todo.active, this.activeTemplate, this.element.activeList);

			// populate the inactive items
			this.populateList(this.todo.done, this.doneTemplate, this.element.doneList);
			
			// make sure the checkboxes are checked
			this.element.doneList.getElements('input').each(function(field){
				field.checked = true;
			});
		},
		
		populateList: function(items, template, listEl){
			items.each(function(item) {
				template += this.template.substitute(item);
			}, this);
			listEl.adopt(Elements.from(template));
			listEl.listInfo(items.length < 1 ? 'show' : 'hide');
		},

		moveFromList: function(){
			this.element.lists.addEvents({
				'change:relay(input)': this.moveItem.bind(this),
				'click:relay(a)': this.deleteItem.bind(this)
			});
		},

		addItem: function(){
			this.element.omnibox.addEvents({
				'submit': this.submitItem.bind(this)
			});
		},
		
		submitItem: function(event){
			event.stop();
			var itemFrom = this.element.omnibox.getElement('input[type=text]');
			var itemData = {
				title: itemFrom.get('value'),
				id: String.uniqueID()
			};
			if (itemFrom.get('value').trim() !== ''){
				var item = this.template.substitute(itemData);
				Elements.from(item).inject(this.element.activeList, 'top').highlight();
				this.todo.active = [itemData].append(this.todo.active);
				itemFrom.set('value', '');
				this.element.activeList.listInfo('hide');
				this.sendItem(itemData, 'add');
			}
			//this.sendLists();
		},

		moveItem: function(event){
			event.target.getParent().moveTo(event.target.checked ? this.element.doneList : this.element.activeList);
			this.todo.done = this.updateList(this.element.doneList);
			this.todo.active = this.updateList(this.element.activeList);
			this.sendItem(event.target.getParent(), event.target.checked ? 'done' : 'active');
			this.element.doneList.listInfo(this.todo.done.length < 1 ? 'show' : 'hide');
			this.element.activeList.listInfo(this.todo.active.length < 1 ? 'show' : 'hide');
		},
		
		showAgent: function(){
			this.element.agent.tween('top', 0);
		},
		
		hideAgent: function(){
			this.element.agent.tween('top', -80);
		},
		
		updateList: function(list){
			var updatedList = [];
			list.getElements('li').each(function(item){
				updatedList.include({
					id: item.get('data-id'),
					title: item.getElement('span').get('html')
				});
			});
			return updatedList;
		},

		deleteItem: function(event){
			event.stop();
			var list = event.target.getPrevious('input').checked ? this.todo.done : this.todo.active;
			var itemCont = event.target.getParent();
			if (list.length <= 1){
				itemCont.listInfo('show');
			}
			Object.each(list, function(item){
				if (item.id == itemCont.get('data-id')){
					itemCont.destroy();
					list = list.erase(item);
					this.sendItem(itemCont, 'delete');
				}
			}.bind(this));
		},
		
		sendItem: function(item, mode){
			if (typeOf(item) === 'element'){
				item = {
					'title': item.get('data-title'),
					'id': item.get('data-id')
				};
			}
			
			new Request({
				url: '/lists/{permalinkHash}'.substitute(todoLists),
				method: 'put',
				data: Object.toQueryString({
					'id': this.todo.permalinkHash + ':' + item.id,
					'title': item.title,
					'mode': mode
				}),
				onSuccess: this.hideAgent.bind(this),
				onRequest: this.showAgent.bind(this)
			}).send();
		}
	});

})();
