<?php

namespace App\View\Components;

use Illuminate\View\Component;

/**
 * Autocomplete Input Component
 * 
 * Provides autocomplete functionality for input fields
 */
class AutocompleteInput extends Component
{
    public string $name;
    public string $id;
    public string $placeholder;
    public string $value;
    public string $url;
    public string $displayField;
    public string $valueField;
    public int $minLength;
    public int $delay;
    public bool $required;
    public string $class;
    public array $attributes;

    /**
     * Create a new component instance.
     */
    public function __construct(
        string $name,
        string $id = '',
        string $placeholder = '',
        string $value = '',
        string $url = '',
        string $displayField = 'name',
        string $valueField = 'id',
        int $minLength = 2,
        int $delay = 300,
        bool $required = false,
        string $class = 'form-control',
        array $attributes = []
    ) {
        $this->name = $name;
        $this->id = $id ?: $name;
        $this->placeholder = $placeholder;
        $this->value = $value;
        $this->url = $url;
        $this->displayField = $displayField;
        $this->valueField = $valueField;
        $this->minLength = $minLength;
        $this->delay = $delay;
        $this->required = $required;
        $this->class = $class;
        $this->attributes = $attributes;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view('components.autocomplete-input');
    }

    /**
     * Get input attributes
     */
    public function getInputAttributes(): string
    {
        $attrs = array_merge([
            'type' => 'text',
            'name' => $this->name,
            'id' => $this->id,
            'placeholder' => $this->placeholder,
            'value' => $this->value,
            'class' => $this->class,
            'data-autocomplete-url' => $this->url,
            'data-display-field' => $this->displayField,
            'data-value-field' => $this->valueField,
            'data-min-length' => $this->minLength,
            'data-delay' => $this->delay,
            'autocomplete' => 'off',
        ], $this->attributes);

        if ($this->required) {
            $attrs['required'] = 'required';
        }

        $attributeString = '';
        foreach ($attrs as $key => $val) {
            if ($val !== null && $val !== '') {
                $attributeString .= " {$key}=\"" . htmlspecialchars($val) . "\"";
            }
        }

        return $attributeString;
    }
}