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
			
			// concat the template strings
			items.each(function(item) {
				template += this.template.substitute(item);
			}, this);
			listEl.adopt(Elements.from(template));
			
			// either, show or hide the info message
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
				submit: this.submitItem.bind(this)
			});
		},
		
		submitItem: function(event){
			event.stop();
			var itemFrom = this.element.omnibox.getElement('input[type=text]');
			var itemData = {
				title: itemFrom.get('value'),
				id: String.uniqueID()
			};
			
			// Can't add empty items
			if (itemFrom.get('value').trim() !== ''){
				var item = this.template.substitute(itemData);
				
				// Inject and flash
				Elements.from(item).inject(this.element.activeList, 'top').highlight();
				
				// Add to the global list
				this.todo.active = [itemData].append(this.todo.active);
				
				// Clear the OmniBox
				itemFrom.set('value', '');
				
				// Hide the message inside the list
				this.element.activeList.listInfo('hide');
				
				// Store the new item
				this.sendItem(itemData, 'add');
			}
		},

		moveItem: function(event){
			
			// Move elements between lists
			event.target.getParent().moveTo(event.target.checked ? this.element.doneList : this.element.activeList);
			
			// Update objects with the new order/items
			this.todo.done = this.updateList(this.element.doneList);
			this.todo.active = this.updateList(this.element.activeList);
			
			// Mark items as done/active
			this.sendItem(event.target.getParent(), event.target.checked ? 'done' : 'active');
			
			// Be sure to show/hide the empty-list-message
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
			
			// Switch lists
			var list = event.target.getPrevious('input').checked ? this.todo.done : this.todo.active;
			var itemCont = event.target.getParent();
			
			// Show the empty-list-message if it's empty
			if (list.length <= 1){
				itemCont.listInfo('show');
			}
			
			// Destroy the element and the object
			Object.each(list, function(item){
				if (item.id == itemCont.get('data-id')){
					itemCont.destroy();
					list = list.erase(item);
					
					// Tell the backend, the object needs to be destroyed
					this.sendItem(itemCont, 'delete');
				}
			}.bind(this));
		},
		
		parseElement: function(item){
			
			// If passed reference is an element, objectify it - in a completely, non-sexual way!
			if (typeOf(item) === 'element'){
				item = {
					title: item.get('data-title'),
					id: item.get('data-id')
				};
			}
			return item;
		},
		
		sendItem: function(item, mode){
			this.storeOrder(this.parseElement(item), mode);
		},
		
		storeOrder: function(item, mode){
			new Request({
				url: '/lists/{permalinkHash}'.substitute(this.todo),
				method: 'put',
				data: Object.toQueryString({
					id: this.todo.permalinkHash + ':' + item.id,
					title: item.title,
					mode: mode
				}),
				onSuccess: this.hideAgent.bind(this),
				onRequest: this.showAgent.bind(this)
			}).send();
		}
	});

})();

