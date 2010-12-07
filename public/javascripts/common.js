
(function(){

	Element.implement({
		moveTo: function(element) {
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
		}
	});
    

	var AsapList = this.AsapList = new Class({

		todo: {},

		initialize: function(presetList) {
			self = this;
			this.todo = presetList;
			this.template = '<li data-id="{id}"><input type="checkbox" /> <span>{title}</span> <a href="#">Delete</a></li>';
			this.activeTemplate = '';
			this.doneTemplate = '';

			this.element = {
				activeList: document.id('active-todo'),
				doneList: document.id('done-todo'),
				lists: document.getElements('ul')
			};

			this.todo.active.each(function(item) {
				this.activeTemplate += this.template.substitute(item);
			}, this);
			this.element.activeList.adopt(Elements.from(this.activeTemplate));

			this.todo.done.each(function(item) {
				this.doneTemplate += this.template.substitute(item);
			}, this);
			this.element.doneList.adopt(Elements.from(this.doneTemplate));
			this.element.doneList.getElements('input').each(function(field){
				field.checked = true;
			});

			this.setup();
		},

		setup: function() {
			this.moveFromList();
			this.addItem();
		},

		moveFromList: function() {
			this.element.lists.addEvents({
				'change:relay(input)': this.moveItem,
				'click:relay(a)': this.deleteItem
			});
		},

		addItem: function() {
			document.id('omni-box').addEvents({
				submit: function(event) {
					event.stop();
					var itemFrom = this.getElement('input[type=text]');
					var itemData = {
						title: itemFrom.get('value'),
						id: Number.random(10000, 99999)
					};
					if (itemFrom.get('value').trim() !== '') {
						var item = self.template.substitute(itemData);
						Elements.from(item).inject(self.element.activeList, 'top').highlight();
						self.todo.active = [itemData].append(self.todo.active);
						itemFrom.set('value', '');
					}
				}
			});
		},

		moveItem: function() {
			var item = this.getParent();
			item.moveTo(this.checked ? self.element.doneList : self.element.activeList);
		},

		deleteItem: function(event) {
			event.stop();
			var itemCont = this.getParent();
			var id = itemCont.get('data-id');

			Object.each(this.checked ? self.todo.done : self.todo.active, function(item, index) {
				if (item.id == this) {
					self.todo.active.erase(item);
					itemCont.destroy();
				}
			}.bind(id));

			console.log(self.todo.active);
		}

	});

	// new AsapList();

})();
